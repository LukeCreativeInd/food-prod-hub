import { createClient } from "@/lib/supabase/server";
import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/lib/support-ticket-types";

export type PlatformSupportTicketFilters = {
  status?: SupportTicketStatus | "all";
  priority?: SupportTicketPriority | "all";
  category?: SupportTicketCategory | "all";
  organisationId?: string | "all";
  q?: string;
};

type SupportTicketRow = {
  id: string;
  organisation_id: string;
  created_by_profile_id: string | null;
  assigned_to_profile_id: string | null;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  source: string;
  related_path: string | null;
  related_module_key: string | null;
  customer_last_activity_at: string | null;
  support_last_activity_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

type OrganisationRow = {
  id: string;
  name: string;
  slug: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export type PlatformSupportTicket = SupportTicketRow & {
  organisation: OrganisationRow | null;
  createdBy: ProfileRow | null;
  assignedTo: ProfileRow | null;
};

export type PlatformSupportTicketComment = {
  id: string;
  ticket_id: string;
  organisation_id: string;
  author_profile_id: string | null;
  body: string;
  visibility: string;
  source: string;
  created_at: string;
  archived_at: string | null;
  author: ProfileRow | null;
};

export type PlatformSupportTicketEvent = {
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
  actor: ProfileRow | null;
};

export type PlatformSupportInboxSummary = {
  open: number;
  waitingOnSupport: number;
  waitingOnCustomer: number;
  highPriority: number;
};

async function getOrganisationsById(ids: string[]) {
  if (ids.length === 0) {
    return new Map<string, OrganisationRow>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organisations")
    .select("id, name, slug")
    .in("id", ids);

  if (error || !data) {
    return new Map<string, OrganisationRow>();
  }

  return new Map((data as OrganisationRow[]).map((row) => [row.id, row]));
}

async function getProfilesById(ids: string[]) {
  if (ids.length === 0) {
    return new Map<string, ProfileRow>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", ids);

  if (error || !data) {
    return new Map<string, ProfileRow>();
  }

  return new Map((data as ProfileRow[]).map((row) => [row.id, row]));
}

function uniqueStrings(values: Array<string | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

async function hydrateTickets(rows: SupportTicketRow[]) {
  const organisationsById = await getOrganisationsById(
    uniqueStrings(rows.map((row) => row.organisation_id)),
  );
  const profilesById = await getProfilesById(
    uniqueStrings(
      rows.flatMap((row) => [
        row.created_by_profile_id,
        row.assigned_to_profile_id,
      ]),
    ),
  );

  return rows.map((row) => ({
    ...row,
    organisation: organisationsById.get(row.organisation_id) ?? null,
    createdBy: row.created_by_profile_id
      ? profilesById.get(row.created_by_profile_id) ?? null
      : null,
    assignedTo: row.assigned_to_profile_id
      ? profilesById.get(row.assigned_to_profile_id) ?? null
      : null,
  }));
}

function matchesSearch(ticket: SupportTicketRow, q?: string) {
  const search = q?.trim().toLowerCase();

  if (!search) {
    return true;
  }

  return (
    ticket.title.toLowerCase().includes(search) ||
    ticket.description.toLowerCase().includes(search)
  );
}

export async function getPlatformSupportInbox(
  filters: PlatformSupportTicketFilters,
) {
  const supabase = await createClient();
  let query = supabase
    .from("support_tickets")
    .select(
      `
      id,
      organisation_id,
      created_by_profile_id,
      assigned_to_profile_id,
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
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.organisationId && filters.organisationId !== "all") {
    query = query.eq("organisation_id", filters.organisationId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  const filteredRows = (data as SupportTicketRow[]).filter((ticket) =>
    matchesSearch(ticket, filters.q),
  );

  return hydrateTickets(filteredRows);
}

async function countTicketsByFilter(
  filter: Partial<Pick<SupportTicketRow, "status" | "priority">>,
) {
  const supabase = await createClient();
  let query = supabase
    .from("support_tickets")
    .select("id", { count: "exact", head: true })
    .is("archived_at", null);

  if (filter.status) {
    query = query.eq("status", filter.status);
  }

  if (filter.priority) {
    query = query.eq("priority", filter.priority);
  }

  const { count, error } = await query;

  return error ? 0 : count ?? 0;
}

export async function getPlatformSupportInboxSummary(): Promise<PlatformSupportInboxSummary> {
  const [open, waitingOnSupport, waitingOnCustomer, high, urgent] =
    await Promise.all([
      countTicketsByFilter({ status: "open" }),
      countTicketsByFilter({ status: "waiting_on_support" }),
      countTicketsByFilter({ status: "waiting_on_customer" }),
      countTicketsByFilter({ priority: "high" }),
      countTicketsByFilter({ priority: "urgent" }),
    ]);

  return {
    open,
    waitingOnSupport,
    waitingOnCustomer,
    highPriority: high + urgent,
  };
}

export async function getPlatformSupportOrganisations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organisations")
    .select("id, name, slug")
    .eq("status", "active")
    .is("archived_at", null)
    .order("name", { ascending: true });

  return error || !data ? [] : (data as OrganisationRow[]);
}

export async function getPlatformSupportTicketDetail(ticketId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select(
      `
      id,
      organisation_id,
      created_by_profile_id,
      assigned_to_profile_id,
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

  const [ticket] = await hydrateTickets([data as SupportTicketRow]);

  return ticket ?? null;
}

async function hydratePeopleForRows<
  T extends { author_profile_id?: string | null; actor_profile_id?: string | null },
>(rows: T[]) {
  const profilesById = await getProfilesById(
    uniqueStrings(
      rows.map((row) => row.author_profile_id ?? row.actor_profile_id ?? null),
    ),
  );

  return profilesById;
}

export async function getPlatformSupportTicketComments(ticketId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_ticket_comments")
    .select(
      "id, ticket_id, organisation_id, author_profile_id, body, visibility, source, created_at, archived_at",
    )
    .eq("ticket_id", ticketId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  const rows = data as Omit<PlatformSupportTicketComment, "author">[];
  const profilesById = await hydratePeopleForRows(rows);

  return rows.map((row) => ({
    ...row,
    author: row.author_profile_id
      ? profilesById.get(row.author_profile_id) ?? null
      : null,
  }));
}

export async function getPlatformSupportTicketEvents(ticketId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_ticket_events")
    .select(
      "id, ticket_id, organisation_id, actor_profile_id, event_type, event_summary, visibility, from_value, to_value, created_at",
    )
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  const rows = data as Omit<PlatformSupportTicketEvent, "actor">[];
  const profilesById = await hydratePeopleForRows(rows);

  return rows.map((row) => ({
    ...row,
    actor: row.actor_profile_id
      ? profilesById.get(row.actor_profile_id) ?? null
      : null,
  }));
}
