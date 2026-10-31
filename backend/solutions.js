import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID, createHmac } from "crypto";
import multer from "multer";
import { pool } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const SOLUTIONS_DIR = process.env.VERCEL
  ? path.join("/tmp", "uploads", "solutions")
  : path.join(__dirname, "uploads", "solutions");

fs.mkdirSync(SOLUTIONS_DIR, { recursive: true });

// ── Pricing matrix ────────────────────────────────────────────────────────────
// Returns price in paise (₹1 = 100 paise)
export function calcSolutionPrice(goalCategory, paperType) {
  const cat = String(goalCategory || "").toLowerCase();
  const type = String(paperType || "").toLowerCase();
  const isPyqOrBoard = type === "pyq" || type === "board";
  const isPrelims = type === "prelims" || type === "model";

  if (cat === "neet" || cat === "jee-advanced") {
    return isPyqOrBoard ? 4900 : 1900;
  }
  if (cat === "jee-mains") {
    return isPyqOrBoard ? 3900 : 1900;
  }
  if (cat === "mht-cet-pcb" || cat === "mht-cet-pcm") {
    return isPyqOrBoard ? 2900 : 1500;
  }
  if (cat === "board-12") {
    if (isPyqOrBoard) return 1900;
    if (isPrelims) return 900;
    return 500;
  }
  if (cat === "board-10") {
    if (isPyqOrBoard) return 1500;
    if (isPrelims) return 900;
    return 500;
  }
  if (cat === "board-11") {
    return isPrelims ? 900 : 500;
  }
  // board-8, board-9, others
  return 500;
}

// ── Multer setup ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, SOLUTIONS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".pdf";
    cb(null, `sol_${randomUUID()}${ext}`);
  },
});
export const solutionUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype === "application/pdf" || (file.originalname || "").toLowerCase().endsWith(".pdf");
    if (!ok) { cb(new Error("Only PDF files are allowed.")); return; }
    cb(null, true);
  },
});

function removeFile(filePath) {
  if (!filePath) return;
  const abs = path.isAbsolute(filePath) ? filePath : path.join(SOLUTIONS_DIR, path.basename(filePath));
  try { if (fs.existsSync(abs)) fs.unlinkSync(abs); } catch { /* ignore */ }
}

// ── Student: GET /api/papers/:id/solution/meta ────────────────────────────────
export async function getSolutionMeta(req, res) {
  try {
    const paperId = String(req.params.id || "");
    const userId = req.user?.id;

    // Get paper + solution in one go
    const [paperRows] = await pool.query(
      "SELECT id, goal_category, type, solution_price_override FROM papers WHERE id = ? LIMIT 1",
      [paperId]
    );
    if (!paperRows[0]) return res.status(404).json({ error: "Paper not found." });
    const paper = paperRows[0];

    const [solRows] = await pool.query(
      "SELECT * FROM paper_solutions WHERE paper_id = ? AND is_active = 1 LIMIT 1",
      [paperId]
    );
    const solution = solRows[0] || null;

    if (!solution) {
      return res.json({ hasSolution: false });
    }

    // Price: admin override > auto-calculated
    const pricePaise = paper.solution_price_override != null
      ? Number(paper.solution_price_override)
      : calcSolutionPrice(paper.goal_category, paper.type);

    // Has the logged-in user already purchased?
    let purchased = false;
    if (userId) {
      const [purchaseRows] = await pool.query(
        "SELECT id FROM solution_purchases WHERE user_id = ? AND paper_id = ? AND status = 'paid' LIMIT 1",
        [userId, paperId]
      );
      purchased = purchaseRows.length > 0;
    }

    return res.json({
      hasSolution: true,
      solutionId: solution.id,
      pricePaise,
      priceRupees: pricePaise / 100,
      purchased,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
    });
  } catch (err) {
    console.error("getSolutionMeta failed:", err);
    return res.status(500).json({ error: "Could not load solution info." });
  }
}

// ── Student: POST /api/papers/:id/solution/order ─────────────────────────────
export async function createSolutionOrder(req, res) {
  try {
    const paperId = String(req.params.id || "");
    const userId = req.user?.id;

    // Check solution exists
    const [solRows] = await pool.query(
      "SELECT ps.*, p.goal_category, p.type, p.solution_price_override FROM paper_solutions ps JOIN papers p ON ps.paper_id = p.id WHERE ps.paper_id = ? AND ps.is_active = 1 LIMIT 1",
      [paperId]
    );
    if (!solRows[0]) return res.status(404).json({ error: "Solution not available for this paper." });
    const sol = solRows[0];

    // Check already purchased
    const [existing] = await pool.query(
      "SELECT id FROM solution_purchases WHERE user_id = ? AND paper_id = ? AND status = 'paid' LIMIT 1",
      [userId, paperId]
    );
    if (existing.length > 0) return res.status(400).json({ error: "You have already purchased this solution." });

    const pricePaise = sol.solution_price_override != null
      ? Number(sol.solution_price_override)
      : calcSolutionPrice(sol.goal_category, sol.type);

    // Razorpay not configured — return mock order for testing
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrderId;
    if (!keyId || !keySecret) {
      // Demo mode: generate a fake order ID
      razorpayOrderId = `demo_order_${randomUUID()}`;
    } else {
      const { default: Razorpay } = await import("razorpay");
      const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await rzp.orders.create({
        amount: pricePaise,
        currency: "INR",
        receipt: `sol_${paperId.slice(0, 8)}_${Date.now()}`,
        notes: { paperId, userId, solutionId: sol.id },
      });
      razorpayOrderId = order.id;
    }

    // Save pending purchase
    const purchaseId = randomUUID();
    await pool.query(
      `INSERT INTO solution_purchases (id, user_id, paper_id, solution_id, amount_paise, razorpay_order_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [purchaseId, userId, paperId, sol.id, pricePaise, razorpayOrderId]
    );

    return res.json({
      orderId: razorpayOrderId,
      pricePaise,
      priceRupees: pricePaise / 100,
      purchaseId,
      demoMode: !keyId,
    });
  } catch (err) {
    console.error("createSolutionOrder failed:", err);
    return res.status(500).json({ error: "Could not create payment order." });
  }
}

// ── Student: POST /api/papers/:id/solution/verify ────────────────────────────
export async function verifySolutionPayment(req, res) {
  try {
    const paperId = String(req.params.id || "");
    const userId = req.user?.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, demo } = req.body || {};

    // Find the pending purchase
    const [rows] = await pool.query(
      "SELECT * FROM solution_purchases WHERE razorpay_order_id = ? AND user_id = ? LIMIT 1",
      [razorpay_order_id, userId]
    );
    if (!rows[0]) return res.status(404).json({ error: "Purchase not found." });
    const purchase = rows[0];

    // Demo mode: skip signature verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || demo || String(razorpay_order_id).startsWith("demo_order_")) {
      await pool.query(
        "UPDATE solution_purchases SET status = 'paid', razorpay_payment_id = ?, updated_at = NOW() WHERE id = ?",
        [razorpay_payment_id || "demo_payment", purchase.id]
      );
      return res.json({ success: true, message: "Solution unlocked (demo mode)." });
    }

    // Real Razorpay: verify HMAC signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig = createHmac("sha256", keySecret).update(body).digest("hex");
    if (expectedSig !== razorpay_signature) {
      await pool.query("UPDATE solution_purchases SET status = 'failed' WHERE id = ?", [purchase.id]);
      return res.status(400).json({ error: "Payment verification failed. Contact support." });
    }

    await pool.query(
      `UPDATE solution_purchases
       SET status = 'paid', razorpay_payment_id = ?, razorpay_signature = ?, updated_at = NOW()
       WHERE id = ?`,
      [razorpay_payment_id, razorpay_signature, purchase.id]
    );
    return res.json({ success: true, message: "Solution unlocked successfully!" });
  } catch (err) {
    console.error("verifySolutionPayment failed:", err);
    return res.status(500).json({ error: "Payment verification failed." });
  }
}

// ── Student: GET /api/papers/:id/solution/file ───────────────────────────────
// Only accessible if user has a paid purchase
export async function streamSolutionFile(req, res) {
  try {
    const paperId = String(req.params.id || "");
    const userId = req.user?.id;

    // Verify purchase
    const [purchaseRows] = await pool.query(
      "SELECT id FROM solution_purchases WHERE user_id = ? AND paper_id = ? AND status = 'paid' LIMIT 1",
      [userId, paperId]
    );
    if (!purchaseRows[0]) {
      return res.status(403).json({ error: "Purchase required to view this solution." });
    }

    const [solRows] = await pool.query(
      "SELECT * FROM paper_solutions WHERE paper_id = ? AND is_active = 1 LIMIT 1",
      [paperId]
    );
    if (!solRows[0] || !solRows[0].solution_file_path) {
      return res.status(404).json({ error: "Solution PDF not found." });
    }

    const abs = path.join(SOLUTIONS_DIR, path.basename(solRows[0].solution_file_path));
    if (!fs.existsSync(abs)) return res.status(404).json({ error: "Solution file missing." });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="solution.pdf"`);
    res.setHeader("Cache-Control", "private, max-age=3600");
    return fs.createReadStream(abs).pipe(res);
  } catch (err) {
    console.error("streamSolutionFile failed:", err);
    return res.status(500).json({ error: "Could not load solution." });
  }
}

// ── Admin: GET /api/admin/solutions ──────────────────────────────────────────
export async function adminListSolutions(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT ps.*, p.title, p.goal_category, p.type, p.solution_price_override
       FROM paper_solutions ps
       JOIN papers p ON ps.paper_id = p.id
       ORDER BY ps.created_at DESC`
    );
    return res.json({ solutions: rows.map(r => ({
      id: r.id,
      paperId: r.paper_id,
      paperTitle: r.title,
      goalCategory: r.goal_category,
      paperType: r.type,
      solutionFileName: r.solution_file_name,
      hasSolutionFile: Boolean(r.solution_file_path),
      pricePaise: r.solution_price_override != null
        ? Number(r.solution_price_override)
        : calcSolutionPrice(r.goal_category, r.type),
      priceRupees: (r.solution_price_override != null
        ? Number(r.solution_price_override)
        : calcSolutionPrice(r.goal_category, r.type)) / 100,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at,
    }))});
  } catch (err) {
    console.error("adminListSolutions failed:", err);
    return res.status(500).json({ error: "Could not load solutions." });
  }
}

// ── Admin: POST /api/admin/papers/:id/solution ───────────────────────────────
export async function adminUploadSolution(req, res) {
  try {
    const paperId = String(req.params.id || "");
    const [paperRows] = await pool.query("SELECT id FROM papers WHERE id = ? LIMIT 1", [paperId]);
    if (!paperRows[0]) {
      if (req.file) removeFile(req.file.path);
      return res.status(404).json({ error: "Paper not found." });
    }

    // Parse optional price override
    const priceOverride = req.body?.priceOverridePaise != null
      ? Number(req.body.priceOverridePaise) || null
      : null;

    // Update price override on paper regardless of file
    if (priceOverride !== null) {
      await pool.query("UPDATE papers SET solution_price_override = ? WHERE id = ?", [priceOverride, paperId]);
    }

    const [existing] = await pool.query("SELECT * FROM paper_solutions WHERE paper_id = ? LIMIT 1", [paperId]);
    if (existing[0]) {
      // Update existing
      let filePath = existing[0].solution_file_path;
      let fileName = existing[0].solution_file_name;
      if (req.file) {
        removeFile(existing[0].solution_file_path);
        filePath = path.basename(req.file.path);
        fileName = req.file.originalname;
      }
      await pool.query(
        "UPDATE paper_solutions SET solution_file_path = ?, solution_file_name = ?, is_active = 1, updated_at = NOW() WHERE paper_id = ?",
        [filePath, fileName, paperId]
      );
    } else {
      if (!req.file) return res.status(400).json({ error: "Please upload a solution PDF." });
      const id = randomUUID();
      await pool.query(
        "INSERT INTO paper_solutions (id, paper_id, solution_file_name, solution_file_path, is_active) VALUES (?, ?, ?, ?, 1)",
        [id, paperId, req.file.originalname, path.basename(req.file.path)]
      );
    }

    const [solRows] = await pool.query("SELECT * FROM paper_solutions WHERE paper_id = ? LIMIT 1", [paperId]);
    return res.status(201).json({ solution: solRows[0] });
  } catch (err) {
    if (req.file) removeFile(req.file.path);
    console.error("adminUploadSolution failed:", err);
    return res.status(500).json({ error: "Could not save solution." });
  }
}

// ── Admin: DELETE /api/admin/papers/:id/solution ─────────────────────────────
export async function adminDeleteSolution(req, res) {
  try {
    const paperId = String(req.params.id || "");
    const [rows] = await pool.query("SELECT * FROM paper_solutions WHERE paper_id = ? LIMIT 1", [paperId]);
    if (!rows[0]) return res.status(404).json({ error: "Solution not found." });
    removeFile(rows[0].solution_file_path);
    await pool.query("DELETE FROM paper_solutions WHERE paper_id = ?", [paperId]);
    return res.json({ ok: true });
  } catch (err) {
    console.error("adminDeleteSolution failed:", err);
    return res.status(500).json({ error: "Could not delete solution." });
  }
}

export function handleSolutionUploadError(err, _req, res, next) {
  if (!err) return next();
  if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ error: "Solution PDF must be 20MB or smaller." });
  if (err.message === "Only PDF files are allowed.") return res.status(400).json({ error: err.message });
  return next(err);
}
