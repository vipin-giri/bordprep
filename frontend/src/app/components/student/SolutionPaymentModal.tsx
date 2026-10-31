import { useState } from "react";
import { X, Lock, CreditCard, Smartphone, AlertCircle, CheckCircle, Loader2, IndianRupee } from "lucide-react";
import { createSolutionOrder, verifySolutionPayment } from "../../lib/api";
import { toast } from "sonner";

// Extend window for Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance { open(): void; }

interface Props {
  paperId: string;
  paperTitle: string;
  priceRupees: number;
  razorpayKeyId: string | null | undefined;
  userEmail?: string;
  userName?: string;
  onSuccess: () => void;
  onClose: () => void;
}

async function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function SolutionPaymentModal({ paperId, paperTitle, priceRupees, razorpayKeyId, userEmail, userName, onSuccess, onClose }: Props) {
  const [step, setStep] = useState<"confirm" | "processing" | "success" | "error">("confirm");
  const [errorMsg, setErrorMsg] = useState("");
  const isDemoMode = !razorpayKeyId;

  const handlePay = async () => {
    setStep("processing");
    setErrorMsg("");
    try {
      const order = await createSolutionOrder(paperId);

      if (order.demoMode || isDemoMode) {
        // Demo mode: skip Razorpay, directly verify
        await verifySolutionPayment(paperId, {
          razorpay_order_id: order.orderId,
          razorpay_payment_id: `demo_pay_${Date.now()}`,
          demo: true,
        });
        setStep("success");
        toast.success("Solution unlocked! 🎉 (Demo mode)");
        setTimeout(() => { onSuccess(); }, 1500);
        return;
      }

      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setStep("error");
        setErrorMsg("Could not load payment gateway. Check your internet connection.");
        return;
      }

      const rzp = new window.Razorpay({
        key: razorpayKeyId!,
        amount: order.pricePaise,
        currency: "INR",
        name: "ParikshaCrack",
        description: `Solution: ${paperTitle}`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            setStep("processing");
            await verifySolutionPayment(paperId, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setStep("success");
            toast.success("Solution unlocked! 🎉");
            setTimeout(() => { onSuccess(); }, 1500);
          } catch (err) {
            setStep("error");
            setErrorMsg(err instanceof Error ? err.message : "Payment verification failed.");
          }
        },
        prefill: { name: userName, email: userEmail },
        theme: { color: "#1E3A8A" },
        modal: {
          ondismiss: () => {
            if (step === "processing") setStep("confirm");
          },
        },
      });
      rzp.open();
    } catch (err) {
      setStep("error");
      setErrorMsg(err instanceof Error ? err.message : "Could not initiate payment.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-white" />
            <span className="text-white font-bold text-sm">Unlock Solution</span>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {step === "confirm" && (
            <>
              <p className="text-slate-500 text-xs mb-3 line-clamp-2">
                <span className="font-semibold text-slate-700">{paperTitle}</span>
              </p>

              {/* Price card */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 text-center">
                <div className="flex items-center justify-center gap-1 text-[#1E3A8A]">
                  <IndianRupee size={20} className="font-bold" />
                  <span className="text-3xl font-extrabold">{priceRupees}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">One-time · Lifetime access</p>
              </div>

              {/* What you get */}
              <ul className="space-y-1.5 mb-4">
                {[
                  "Step-by-step PDF solution",
                  "Side-by-side with question paper",
                  "Permanent access — no expiry",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              {isDemoMode && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3 text-xs text-amber-700">
                  <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                  <span><strong>Demo Mode:</strong> Payment gateway not configured. Click "Unlock" to test without real payment.</span>
                </div>
              )}

              {/* Payment methods */}
              {!isDemoMode && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Smartphone size={11} /> UPI
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <CreditCard size={11} /> Cards
                  </div>
                  <span className="text-[10px] text-slate-400">Net Banking · Wallets</span>
                  <span className="ml-auto text-[10px] font-semibold text-emerald-600">🔒 Secured by Razorpay</span>
                </div>
              )}

              <button
                onClick={handlePay}
                className="w-full bg-[#1E3A8A] hover:bg-blue-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                <Lock size={15} />
                {isDemoMode ? "Unlock Solution (Demo)" : `Pay ₹${priceRupees} & Unlock`}
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-2">
                Instant access after payment
              </p>
            </>
          )}

          {step === "processing" && (
            <div className="py-8 text-center">
              <Loader2 size={32} className="animate-spin text-[#1E3A8A] mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Processing payment...</p>
              <p className="text-xs text-slate-400 mt-1">Please do not close this window</p>
            </div>
          )}

          {step === "success" && (
            <div className="py-8 text-center">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">Solution Unlocked! 🎉</p>
              <p className="text-xs text-slate-400 mt-1">Opening solution PDF...</p>
            </div>
          )}

          {step === "error" && (
            <div className="py-6 text-center">
              <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 mb-1">Payment Failed</p>
              <p className="text-xs text-red-500 mb-4">{errorMsg}</p>
              <button
                onClick={() => setStep("confirm")}
                className="px-5 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

