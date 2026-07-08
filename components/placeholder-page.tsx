import { PageHeader } from "@/components/page-header";
import { EmptyState, PageActionButton, SectionCard } from "@/components/ui";
import { requireAuth } from "@/lib/auth";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export async function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  await requireAuth();

  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <SectionCard
          title={`${title} workspace`}
          description={description}
          action={
            <PageActionButton href="/dashboard" variant="secondary">
              Back to dashboard
            </PageActionButton>
          }
        >
          <EmptyState
            title={`${title} is ready for a future workflow`}
            description="This module is currently a design-system placeholder. No real data, business logic, authentication, database schema, or calculations have been added."
          />
        </SectionCard>
      </div>
    </>
  );
}
