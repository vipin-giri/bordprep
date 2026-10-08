import type { GoalCategory } from "../data/mockData";
import { GOAL_METADATA } from "../data/mockData";
import type { StudentPaper, StudentQuiz } from "../../lib/api";
import type { FolderNode, FolderIconType } from "./FolderExplorer";

function goalMeta(cat: string) {
  const meta = GOAL_METADATA[cat as GoalCategory];
  let iconType: FolderIconType = "default";
  if (cat === "board-8" || cat === "board-9" || cat === "board-10") iconType = "school";
  else if (cat.startsWith("board-")) iconType = "college";
  else if (cat.includes("jee") || cat === "mht-cet-pcm") iconType = "engineering";
  else if (cat.includes("neet") || cat === "mht-cet-pcb") iconType = "medical";

  const color =
    cat.startsWith("board-") ? "from-blue-600 to-indigo-700"
      : cat.includes("jee") ? "from-violet-600 to-indigo-700"
        : cat.includes("neet") ? "from-emerald-600 to-teal-700"
          : "from-cyan-600 to-blue-700";

  return {
    name: meta?.label ?? (cat || "General"),
    color,
    iconType,
  };
}

function groupBy<T>(items: T[], keyFn: (item: T) => string) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item) || "General";
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  }
  return map;
}

export function buildPaperFolders(papers: StudentPaper[]): FolderNode[] {
  return [...groupBy(papers, (p) => p.goalCategory || "general").entries()].map(([goal, goalPapers]) => {
    const meta = goalMeta(goal);
    const subjectFolders: FolderNode[] = [...groupBy(goalPapers, (p) => p.subject).entries()].map(([subject, subjectPapers]) => {
      const years = [...new Set(subjectPapers.map((p) => p.year))].sort((a, b) => b - a);
      return {
        id: `paper-${goal}-${subject}`,
        name: subject,
        iconType: "subject",
        goalCategory: goal as GoalCategory,
        subject,
        children: years.map((year) => ({
          id: `paper-${goal}-${subject}-${year}`,
          name: String(year),
          iconType: "year" as const,
          goalCategory: goal as GoalCategory,
          subject,
          year,
        })),
      };
    });

    return {
      id: `paper-goal-${goal}`,
      name: meta.name,
      description: `${goalPapers.length} published paper${goalPapers.length === 1 ? "" : "s"}`,
      badge: String(goalPapers.length),
      color: meta.color,
      iconType: meta.iconType,
      goalCategory: goal as GoalCategory,
      children: subjectFolders,
    };
  });
}

export function buildQuizFolders(quizzes: StudentQuiz[]): FolderNode[] {
  return [...groupBy(quizzes, (q) => q.goalCategory || "general").entries()].map(([goal, goalQuizzes]) => {
    const meta = goalMeta(goal);
    const subjectFolders: FolderNode[] = [...groupBy(goalQuizzes, (q) => q.subject).entries()].map(([subject]) => ({
      id: `quiz-${goal}-${subject}`,
      name: subject,
      iconType: "subject",
      goalCategory: goal as GoalCategory,
      subject,
    }));

    return {
      id: `quiz-goal-${goal}`,
      name: meta.name,
      description: `${goalQuizzes.length} published quiz${goalQuizzes.length === 1 ? "" : "zes"}`,
      badge: String(goalQuizzes.length),
      color: meta.color,
      iconType: meta.iconType,
      goalCategory: goal as GoalCategory,
      children: subjectFolders,
    };
  });
}
