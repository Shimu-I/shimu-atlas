import { Library as LibraryIcon } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { EmptyState } from "../components/ui/EmptyState";

export function LibraryPage() {
  return (
    <>
      <PageHeader title="My Library" subtitle="Your books, in one place." crumbs={[{ label: "Atlas", to: "/" }, { label: "My Library" }]} />
      <EmptyState icon={LibraryIcon} title="Your library is empty">
        Uploading books, search, filters and the grid and list views arrive in step 1c.
      </EmptyState>
    </>
  );
}
