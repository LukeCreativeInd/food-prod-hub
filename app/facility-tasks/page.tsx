import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { FacilityTaskCard } from "@/components/production/facility-task-card";
import { AlertCard, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { requirePermissionAccess } from "@/lib/auth";

const tasks = [
  {
    task: "Mix Chicken Fajita chicken",
    area: "Kitchen",
    material: "Chicken batch placeholder",
    required: "145 kg",
    actual: "Enter weight later",
    checks: "Supervisor weight check",
    status: "Ready",
  },
  {
    task: "Prepare Sweet Potato Mash",
    area: "Kitchen",
    material: "Sweet potato batch placeholder",
    required: "96 kg",
    actual: "Enter weight later",
    checks: "Yield confirmation",
    status: "In progress",
  },
  {
    task: "Pack Burrito Bowls",
    area: "Packing Room",
    material: "Burrito Bowl components",
    required: "620 meals",
    actual: "Enter count later",
    checks: "Label and sleeve check",
    status: "Ready",
  },
];

export default async function FacilityTasksPage() {
  await requirePermissionAccess("production.tasks.view");

  return (
    <AppShell>
      <PageHeader
        title="Facility / iPad View"
        description="Future floor-staff task screen preview for production areas and iPad devices."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tasks visible"
            value="12"
            helperText="Sample task list for floor-staff review."
            badge="Demo"
            tone="info"
            icon="IP"
          />
          <StatCard
            label="Ready to start"
            value="5"
            helperText="Static ready-task examples."
            badge="Ready"
            tone="success"
            icon="GO"
          />
          <StatCard
            label="Checks needed"
            value="4"
            helperText="Placeholder supervisor/QA checks."
            badge="Review"
            tone="warning"
            icon="QA"
          />
          <StatCard
            label="Issues/waste"
            value="3"
            helperText="Sample issue and waste prompts."
            badge="Sample"
            tone="neutral"
            icon="!"
          />
        </section>

        <SectionCard
          title="Touch-friendly task cards"
          description="Visual preview only. Start/complete controls do not save anything yet."
          action={<StatusBadge tone="info">Sample layout only</StatusBadge>}
        >
          <div className="grid gap-4 xl:grid-cols-3">
            {tasks.map((task) => (
              <FacilityTaskCard key={task.task} {...task} />
            ))}
          </div>
        </SectionCard>

        <section className="grid gap-6 xl:grid-cols-3">
          <AlertCard
            title="Report issue"
            description="Future flow for staff to flag missing stock, unclear instructions or equipment problems."
            meta="Placeholder"
            tone="warning"
          />
          <AlertCard
            title="Log waste"
            description="Future flow for recording waste quantity and reason against a task or batch."
            meta="Placeholder"
            tone="warning"
          />
          <AlertCard
            title="Supervisor check"
            description="Future supervisor or QA confirmation before task completion."
            meta="Future"
            tone="info"
          />
        </section>
      </div>
    </AppShell>
  );
}
