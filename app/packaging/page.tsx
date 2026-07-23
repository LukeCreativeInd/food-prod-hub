import { InternalItemsWorkspacePage } from "@/app/internal-items/internal-items-workspace-page";

type PageProps = {
  searchParams: Promise<{
    create?: string;
  }>;
};

export default function PackagingPage({ searchParams }: PageProps) {
  return (
    <InternalItemsWorkspacePage
      itemType="packaging"
      title="Packaging"
      description="Manage canonical internal packaging records used across costings, finished products, purchasing and inventory."
      createTitle="Create packaging item"
      emptyTitle="No packaging items yet"
      emptyDescription="Create packaging manually here once needed. Informational invoice lines such as cartons remain excluded unless reviewed as true packaging records."
      typeLabel="Packaging"
      searchParams={searchParams}
    />
  );
}
