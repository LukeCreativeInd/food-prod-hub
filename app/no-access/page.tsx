import { LogoutButton } from "@/components/auth/logout-button";
import { PageHeader } from "@/components/page-header";
import { EmptyState, PageActionButton, SectionCard } from "@/components/ui";
import { requireAppAccess } from "@/lib/auth";

export default async function NoAccessPage() {
  await requireAppAccess();

  return (
    <div className="min-h-screen bg-[#f6f8f5]">
      <PageHeader
        title="No access"
        description="Your account is signed in, but it does not have permission to view that page."
      />

      <div className="px-5 py-6 md:px-8">
        <SectionCard
          title="Permission required"
          description="This page is available only to users with the required admin permission."
          action={
            <PageActionButton href="/dashboard" variant="secondary">
              Back to dashboard
            </PageActionButton>
          }
        >
          <EmptyState
            title="Contact the platform/admin team"
            description="Ask an admin to review your role and permissions. No sensitive debug data or business module data is shown here."
            action={
              <div className="mx-auto max-w-xs">
                <LogoutButton variant="light" />
              </div>
            }
          />
        </SectionCard>
      </div>
    </div>
  );
}
