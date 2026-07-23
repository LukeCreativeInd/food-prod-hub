import { InternalItemsWorkspacePage } from "@/app/internal-items/internal-items-workspace-page";

type PageProps = {
  searchParams: Promise<{
    create?: string;
  }>;
};

export default function IngredientsPage({ searchParams }: PageProps) {
  return (
    <InternalItemsWorkspacePage
      itemType="ingredient"
      title="Ingredients"
      description="Manage canonical internal ingredient records used across costings, formulas, purchasing and inventory."
      createTitle="Create ingredient"
      emptyTitle="No ingredient items yet"
      emptyDescription="Create an ingredient manually here, or use Tools -> Supplier Invoice Intake to create ingredients from reviewed supplier invoice commits."
      typeLabel="Ingredient"
      searchParams={searchParams}
    />
  );
}
