import {
  BarChart3, BookMarked, BookOpen, Briefcase, Compass, FolderKanban, Home,
  Library, type LucideIcon, NotebookPen, Settings, Sparkles, Target,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  group: "Read" | "Think" | "Grow" | "System";
  /** Which build phase delivers this screen; shown on its empty state. */
  phase: string;
}

export const NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home, group: "Read", phase: "1e" },
  { to: "/library", label: "My Library", icon: Library, group: "Read", phase: "1c" },
  { to: "/reading", label: "Reading", icon: BookOpen, group: "Read", phase: "1d" },
  { to: "/notes", label: "My Notes", icon: NotebookPen, group: "Think", phase: "2" },
  { to: "/knowledge", label: "Knowledge Explorer", icon: Compass, group: "Think", phase: "2–4" },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles, group: "Think", phase: "3" },
  { to: "/careers", label: "Career Intelligence", icon: Briefcase, group: "Grow", phase: "4" },
  { to: "/recommendations", label: "Learning Recommendations", icon: Target, group: "Grow", phase: "5" },
  { to: "/projects", label: "Projects", icon: FolderKanban, group: "Grow", phase: "6" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, group: "Grow", phase: "6" },
  { to: "/settings", label: "Settings", icon: Settings, group: "System", phase: "1" },
];

/** Compact bottom navigation on phones; everything else lives in the drawer. */
export const BOTTOM_NAV = ["/", "/library", "/reading", "/notes"];

export const GROUPS = ["Read", "Think", "Grow", "System"] as const;

export const BrandIcon = BookMarked;
