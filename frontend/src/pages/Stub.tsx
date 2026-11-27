import { useLocation } from "react-router-dom";
import { Hourglass } from "lucide-react";
import { NAV } from "../lib/nav";
import { PageHeader } from "../components/ui/PageHeader";
import { EmptyState } from "../components/ui/EmptyState";

/** What each upcoming screen will contain, taken from the project specification. */
const PLANS: Record<string, { subtitle: string; body: string }> = {
  "/reading": { subtitle: "Your PDF reading workspace.", body: "Open a book from your library to read it here, with page tracking, bookmarks and synced progress between devices." },
  "/notes": { subtitle: "Book, concept and experience notes.", body: "Markdown notes linked to books, chapters, pages and concepts. Your own writing is always kept separate from AI-generated text." },
  "/knowledge": { subtitle: "How concepts, books, skills and projects connect.", body: "A browsable map of relationships, with an accessible list alternative, built from the notes and mappings you create." },
  "/assistant": { subtitle: "Ask questions across your books and notes.", body: "Answers will cite real pages from your books. This needs indexed PDFs and a local model, and the rest of Atlas keeps working when it is off." },
  "/careers": { subtitle: "Skill maps for eight career paths.", body: "Each skill will show which of your books cover it and your own manually set status. Reading a chapter is never treated as mastery." },
  "/recommendations": { subtitle: "What to read, revisit or build next.", body: "Explainable suggestions you can accept, dismiss or postpone, based on your real reading, notes and skill status." },
  "/projects": { subtitle: "Projects that prove your skills.", body: "Link projects to skills, concepts and the books that supported them." },
  "/analytics": { subtitle: "Your reading habits and learning progress.", body: "Reading time, streaks, AI-question topics and skill development, all computed from recorded activity. Tracking starts when the reader is built, and nothing is back-filled or invented." },
};

export function Stub() {
  const { pathname } = useLocation();
  const item = NAV.find((n) => n.to === pathname);
  const plan = PLANS[pathname];
  if (!item || !plan) return null;
  return (
    <>
      <PageHeader title={item.label} subtitle={plan.subtitle} crumbs={[{ label: "Atlas", to: "/" }, { label: item.label }]} />
      <EmptyState icon={Hourglass} title={`Planned for phase ${item.phase}`}>{plan.body}</EmptyState>
    </>
  );
}
