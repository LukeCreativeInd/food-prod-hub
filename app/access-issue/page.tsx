import { PageHeader } from "@/components/page-header";
import { EmptyState, SectionCard } from "@/components/ui";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireAuth } from "@/lib/auth";

export default async function AccessIssuePage() {
  await requireAuth();

  return (
    <div className="min-h-screen bg-[#f6f8f5]">
      <PageHeader
        title="Access setup needed"
        description="Your sign-in works, but your app access has not been fully set up yet."
      />

      <div className="px-5 py-6 md:px-8">
        <SectionCard
          title="Profile or membership missing"
          description="A valid profile, Clean Eats membership, and active organisation context are required before app pages can load."
        >
          <EmptyState
            title="Contact the platform/admin team"
            description="Ask an admin to confirm your profile, organisation membership, role, and organisation status. No production data or business module data is shown on this page."
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
