import { StatusBadge } from "@/components/ui/status-badge";
import { formatSupportTicketValue } from "@/lib/support-ticket-types";

function statusTone(status: string): "success" | "warning" | "neutral" | "info" {
  if (status === "resolved" || status === "closed") {
    return "success";
  }

  if (status === "waiting_on_customer" || status === "planned") {
    return "warning";
  }

  if (status === "waiting_on_support") {
    return "info";
  }

  return "neutral";
}

function priorityTone(priority: string): "danger" | "warning" | "neutral" {
  if (priority === "urgent") {
    return "danger";
  }

  if (priority === "high") {
    return "warning";
  }

  return "neutral";
}

export function SupportTicketStatusBadge({ status }: { status: string }) {
  return (
    <StatusBadge tone={statusTone(status)}>
      {formatSupportTicketValue(status)}
    </StatusBadge>
  );
}

export function SupportTicketPriorityBadge({ priority }: { priority: string }) {
  return (
    <StatusBadge tone={priorityTone(priority)}>
      {formatSupportTicketValue(priority)}
    </StatusBadge>
  );
}

export function SupportTicketCategoryBadge({ category }: { category: string }) {
  return (
    <StatusBadge tone="info">{formatSupportTicketValue(category)}</StatusBadge>
  );
}
