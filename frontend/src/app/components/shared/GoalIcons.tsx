import {
  BookOpen, School, BookMarked, GraduationCap,
  Stethoscope, Atom, Trophy, Microscope, Calculator,
  Dna, FlaskConical, TrendingUp, Landmark, Map, BookText,
  Languages, Globe, PenLine, BarChart2, Sigma,
  type LucideIcon,
} from "lucide-react";
import type { GoalCategory } from "../data/mockData";

// ── GoalCategory → Lucide Icon ────────────────────────────────────────────────

export const GOAL_ICON_MAP: Record<GoalCategory, LucideIcon> = {
  "board-8":      BookOpen,
  "board-9":      BookOpen,
  "board-10":     School,
  "board-11":     BookMarked,
  "board-12":     GraduationCap,
  "neet":         Stethoscope,
  "jee-mains":    Atom,
  "jee-advanced": Trophy,
  "mht-cet-pcb":  Microscope,
  "mht-cet-pcm":  Calculator,
};

export function GoalIcon({ category, size = 16, className = "", style }: { category: GoalCategory; size?: number; className?: string; style?: React.CSSProperties }) {
  const Icon = GOAL_ICON_MAP[category] ?? BookOpen;
  return <Icon size={size} className={className} style={style} />;
}

// ── Subject Name → Lucide Icon ────────────────────────────────────────────────

export const SUBJECT_ICON_MAP: Record<string, LucideIcon> = {
  "Mathematics":                  Calculator,
  "Science & Technology":         FlaskConical,
  "English":                      BookOpen,
  "Marathi":                      BookText,
  "Hindi":                        BookText,
  "History & Political Science":  Landmark,
  "Geography":                    Map,
  "Physics":                      Atom,
  "Chemistry":                    FlaskConical,
  "Biology":                      Dna,
  "Botany":                       Dna,
  "Zoology":                      Microscope,
  "Commerce":                     TrendingUp,
  "Economics":                    BarChart2,
  "Accountancy":                  BarChart2,
  "Political Science":            Landmark,
  "History":                      Landmark,
  "Languages":                    Languages,
  "Sanskrit":                     BookText,
  "Environmental Studies":        Globe,
  "Information Technology":       Calculator,
};

export function SubjectIcon({ name, size = 14, className = "", style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  const exactMatch = SUBJECT_ICON_MAP[name];
  if (exactMatch) {
    const Icon = exactMatch;
    return <Icon size={size} className={className} style={style} />;
  }
  const partialKey = Object.keys(SUBJECT_ICON_MAP).find(k => name.includes(k) || k.includes(name));
  const Icon = (partialKey ? SUBJECT_ICON_MAP[partialKey] : BookOpen) as LucideIcon;
  return <Icon size={size} className={className} style={style} />;
}
