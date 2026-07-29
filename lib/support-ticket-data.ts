import { createClient } from "@/lib/supabase/server";

export type SupportTicketListItem = {
  id: string;
  organisation_id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  source: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type SupportTicketDetail = SupportTicketListItem & {
  description: string;
  related_path: string | null;
  related_module_key: string | null;
  customer_last_activity_at: string | null;
  support_last_activity_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
};

export type SupportTicketComment = {
  id: string;
  ticket_id: string;
  organisation_id: string;
  author_profile_id: string | null;
  body: string;
  visibility: string;
  source: string;
  created_at: string;
  author:
    | {
        full_name: string | null;
        email: string | null;
      }
    | {
        full_name: string | null;
        email: string | null;
      }[]
    | null;
};

export type SupportTicketEvent = {
  id: string;
  ticket_id: string;
  organisation_id: string;
  actor_profile_id: string | null;
  event_type: string;
  event_summary: string;
  visibility: string;
  from_value: string | null;
  to_value: string | null;
  created_at: string;
  actor:
    | {
        full_name: string | null;
        email: string | null;
      }
    | {
        full_name: string | null;
        email: string | null;
      }[]
    | null;
};

export async function getSupportTicketsForOrganisation(
  organisationId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select(
      "id, organisation_id, title, status, priority, category, source, created_at, updated_at, archived_at",
    )
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data as SupportTicketListItem[] | null) ?? [];
}

export async function getSupportTicketDetail(ticketId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select(
      `
      id,
      organisation_id,
      title,
      description,
      status,
      priority,
      category,
      source,
      related_path,
      related_module_key,
      customer_last_activity_at,
      support_last_activity_at,
      resolved_at,
      closed_at,
      created_at,
      updated_at,
      archived_at
      `,
    )
    .eq("id", ticketId)
    .is("archived_at", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as SupportTicketDetail;
}

export async function getSupportTicketComments(ticketId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_ticket_comments")
    .select(
      `
      id,
      ticket_id,
      organisation_id,
      author_profile_id,
      body,
      visibility,
      source,
      created_at,
      author:profiles (
        full_name,
        email
      )
      `,
    )
    .eq("ticket_id", ticketId)
    .eq("visibility", "customer")
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return (data as SupportTicketComment[] | null) ?? [];
}

export async function getSupportTicketEvents(ticketId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_ticket_events")
    .select(
      `
      id,
      ticket_id,
      organisation_id,
      actor_profile_id,
      event_type,
      event_summary,
      visibility,
      from_value,
      to_value,
      created_at,
      actor:profiles (
        full_name,
        email
      )
      `,
    )
    .eq("ticket_id", ticketId)
    .eq("visibility", "customer")
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return (data as SupportTicketEvent[] | null) ?? [];
}
