import { PageHeader } from "@/components/page-header";
import { EmptyState, PageActionButton, SectionCard } from "@/components/ui";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
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
