import { BookOpen, Briefcase, Clock, Lightbulb, NotebookPen } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader, Section } from "../components/ui/PageHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";

/** Structure only: every block shows an honest empty state until real data exists (wired in 1e). */
export function Dashboard() {
  return (
    <>
      <PageHeader title="Home" subtitle="Where you left off, and what needs attention." />
      <Section title="Continue reading">
        <EmptyState icon={BookOpen} title="No book in progress"
          action={<Link to="/library"><Button variant="primary">Open My Library</Button></Link>}>
          Add a book to your library and start reading. Your last page is remembered across devices.
        </EmptyState>
      </Section>
      <div className="grid gap-x-8 md:grid-cols-2">
        <Section title="Recent notes">
          <EmptyState icon={NotebookPen} title="No notes yet">Notes you write will appear here, newest first.</EmptyState>
        </Section>
        <Section title="Learning activity">
          <EmptyState icon={Clock} title="Nothing recorded yet">Reading sessions will be shown here once you start reading.</EmptyState>
        </Section>
        <Section title="Career goals">
          <EmptyState icon={Briefcase} title="No career path selected">Skill progress appears here once you choose paths to follow.</EmptyState>
        </Section>
        <Section title="Suggested next actions">
          <EmptyState icon={Lightbulb} title="No suggestions yet">Suggestions are based on your real reading and notes, so they begin after you have some.</EmptyState>
        </Section>
      </div>
    </>
  );
}
