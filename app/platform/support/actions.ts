"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import {
  isSupportTicketCategory,
  isSupportTicketPriority,
  isSupportTicketStatus,
} from "@/lib/support-ticket-types";
import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type SupportActionError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function requirePlatformSupportAccess() {
  const authContext = await requirePermissionAccess("platform.tenants.view");

  if (authContext.roleKey !== "platform_admin" || !authContext.profile) {
    redirect("/no-access");
  }

  return {
    profileId: authContext.profile.id,
  };
}

async function getTicketForAction(ticketId: string) {
  if (!uuidPattern.test(ticketId)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select(
      "id, organisation_id, status, priority, category, assigned_to_profile_id",
    )
    .eq("id", ticketId)
    .is("archived_at", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as {
    id: string;
    organisation_id: string;
    status: string;
    priority: string;
    category: string;
    assigned_to_profile_id: string | null;
  };
}

function revalidatePlatformSupportPaths(ticketId: string) {
  revalidatePath("/platform/support");
  revalidatePath(`/platform/support/${ticketId}`);
  revalidatePath("/support/tickets");
  revalidatePath(`/support/tickets/${ticketId}`);
}

function redirectToTicket(ticketId: string, status: string): never {
  redirect(`/platform/support/${ticketId}?support=${status}`);
}

function logSupportActionError(
  action: string,
  error: SupportActionError | null,
  context: Record<string, string | null>,
) {
  if (!error) {
    return;
  }

  console.error("[platform-support-action]", {
    action,
    context,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    },
  });
}

async function insertTicketEvent({
  supabase,
  ticketId,
  organisationId,
  actorProfileId,
  eventType,
  eventSummary,
  visibility,
  fromValue,
  toValue,
}: {
  supabase: SupabaseServerClient;
  ticketId: string;
  organisationId: string;
  actorProfileId: string;
  eventType: string;
  eventSummary: string;
  visibility: "customer" | "internal";
  fromValue?: string | null;
  toValue?: string | null;
}) {
  const { data, error } = await supabase
    .from("support_ticket_events")
    .insert({
      ticket_id: ticketId,
      organisation_id: organisationId,
      actor_profile_id: actorProfileId,
      event_type: eventType,
      event_summary: eventSummary,
      visibility,
      from_value: fromValue ?? null,
      to_value: toValue ?? null,
      metadata: {},
    })
    .select("id")
    .single();

  return { data, error };
}

async function insertTicketComment({
  supabase,
  ticketId,
  organisationId,
  authorProfileId,
  body,
  visibility,
}: {
  supabase: SupabaseServerClient;
  ticketId: string;
  organisationId: string;
  authorProfileId: string;
  body: string;
  visibility: "customer" | "internal";
}) {
  const { data, error } = await supabase
    .from("support_ticket_comments")
    .insert({
      ticket_id: ticketId,
      organisation_id: organisationId,
      author_profile_id: authorProfileId,
      body,
      visibility,
      source: "platform_admin",
    })
    .select("id")
    .single();

  return { data, error };
}

export async function updateSupportTicketStatusAction(formData: FormData) {
  const { profileId } = await requirePlatformSupportAccess();
  const ticketId = getString(formData, "ticket_id");
  const status = getString(formData, "status");
  const ticket = await getTicketForAction(ticketId);

  if (!ticket || !isSupportTicketStatus(status)) {
    redirectToTicket(ticketId, "invalid_status");
  }

  if (ticket.status === status) {
    redirectToTicket(ticket.id, "unchanged");
  }

  const now = new Date().toISOString();
  const updates: Record<string, string | null> = {
    status,
    support_last_activity_at: now,
    updated_at: now,
  };

  if (status === "resolved") {
    updates.resolved_at = now;
  }

  if (status === "closed") {
    updates.closed_at = now;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("support_tickets")
    .update(updates)
    .eq("id", ticket.id);

  if (error) {
    logSupportActionError("status_ticket_update", error, {
      ticketId: ticket.id,
      organisationId: ticket.organisation_id,
      actorProfileId: profileId,
    });
    redirectToTicket(ticket.id, "status_error");
  }

  const { error: eventError } = await insertTicketEvent({
    supabase,
    ticketId: ticket.id,
    organisationId: ticket.organisation_id,
    actorProfileId: profileId,
    eventType: "status_changed",
    eventSummary: "Status changed",
    visibility: "customer",
    fromValue: ticket.status,
    toValue: status,
  });

  logSupportActionError("status_event_insert", eventError, {
    ticketId: ticket.id,
    organisationId: ticket.organisation_id,
    actorProfileId: profileId,
  });

  revalidatePlatformSupportPaths(ticket.id);
  redirectToTicket(ticket.id, eventError ? "status_event_error" : "status_updated");
}

export async function updateSupportTicketPriorityAction(formData: FormData) {
  const { profileId } = await requirePlatformSupportAccess();
  const ticketId = getString(formData, "ticket_id");
  const priority = getString(formData, "priority");
  const ticket = await getTicketForAction(ticketId);

  if (!ticket || !isSupportTicketPriority(priority)) {
    redirectToTicket(ticketId, "invalid_priority");
  }

  if (ticket.priority === priority) {
    redirectToTicket(ticket.id, "unchanged");
  }

  const now = new Date().toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("support_tickets")
    .update({
      priority,
      support_last_activity_at: now,
      updated_at: now,
    })
    .eq("id", ticket.id);

  if (error) {
    logSupportActionError("priority_ticket_update", error, {
      ticketId: ticket.id,
      organisationId: ticket.organisation_id,
      actorProfileId: profileId,
    });
    redirectToTicket(ticket.id, "priority_error");
  }

  const { error: eventError } = await insertTicketEvent({
    supabase,
    ticketId: ticket.id,
    organisationId: ticket.organisation_id,
    actorProfileId: profileId,
    eventType: "priority_changed",
    eventSummary: "Priority changed",
    visibility: "customer",
    fromValue: ticket.priority,
    toValue: priority,
  });

  logSupportActionError("priority_event_insert", eventError, {
    ticketId: ticket.id,
    organisationId: ticket.organisation_id,
    actorProfileId: profileId,
  });

  revalidatePlatformSupportPaths(ticket.id);
  redirectToTicket(
    ticket.id,
    eventError ? "priority_event_error" : "priority_updated",
  );
}

export async function updateSupportTicketCategoryAction(formData: FormData) {
  const { profileId } = await requirePlatformSupportAccess();
  const ticketId = getString(formData, "ticket_id");
  const category = getString(formData, "category");
  const ticket = await getTicketForAction(ticketId);

  if (!ticket || !isSupportTicketCategory(category)) {
    redirectToTicket(ticketId, "invalid_category");
  }

  if (ticket.category === category) {
    redirectToTicket(ticket.id, "unchanged");
  }

  const now = new Date().toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("support_tickets")
    .update({
      category,
      support_last_activity_at: now,
      updated_at: now,
    })
    .eq("id", ticket.id);

  if (error) {
    logSupportActionError("category_ticket_update", error, {
      ticketId: ticket.id,
      organisationId: ticket.organisation_id,
      actorProfileId: profileId,
    });
    redirectToTicket(ticket.id, "category_error");
  }

  const { error: eventError } = await insertTicketEvent({
    supabase,
    ticketId: ticket.id,
    organisationId: ticket.organisation_id,
    actorProfileId: profileId,
    eventType: "category_changed",
    eventSummary: "Category changed",
    visibility: "customer",
    fromValue: ticket.category,
    toValue: category,
  });

  logSupportActionError("category_event_insert", eventError, {
    ticketId: ticket.id,
    organisationId: ticket.organisation_id,
    actorProfileId: profileId,
  });

  revalidatePlatformSupportPaths(ticket.id);
  redirectToTicket(
    ticket.id,
    eventError ? "category_event_error" : "category_updated",
  );
}

export async function assignSupportTicketToMeAction(formData: FormData) {
  const { profileId } = await requirePlatformSupportAccess();
  const ticketId = getString(formData, "ticket_id");
  const ticket = await getTicketForAction(ticketId);

  if (!ticket) {
    redirectToTicket(ticketId, "invalid_ticket");
  }

  const now = new Date().toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("support_tickets")
    .update({
      assigned_to_profile_id: profileId,
      support_last_activity_at: now,
      updated_at: now,
    })
    .eq("id", ticket.id);

  if (error) {
    logSupportActionError("assignment_ticket_update", error, {
      ticketId: ticket.id,
      organisationId: ticket.organisation_id,
      actorProfileId: profileId,
    });
    redirectToTicket(ticket.id, "assignment_error");
  }

  const { error: eventError } = await insertTicketEvent({
    supabase,
    ticketId: ticket.id,
    organisationId: ticket.organisation_id,
    actorProfileId: profileId,
    eventType: "assigned",
    eventSummary: "Ticket assigned",
    visibility: "internal",
    fromValue: ticket.assigned_to_profile_id,
    toValue: profileId,
  });

  logSupportActionError("assignment_event_insert", eventError, {
    ticketId: ticket.id,
    organisationId: ticket.organisation_id,
    actorProfileId: profileId,
  });

  revalidatePlatformSupportPaths(ticket.id);
  redirectToTicket(ticket.id, eventError ? "assignment_event_error" : "assigned");
}

export async function clearSupportTicketAssignmentAction(formData: FormData) {
  const { profileId } = await requirePlatformSupportAccess();
  const ticketId = getString(formData, "ticket_id");
  const ticket = await getTicketForAction(ticketId);

  if (!ticket) {
    redirectToTicket(ticketId, "invalid_ticket");
  }

  const now = new Date().toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("support_tickets")
    .update({
      assigned_to_profile_id: null,
      support_last_activity_at: now,
      updated_at: now,
    })
    .eq("id", ticket.id);

  if (error) {
    logSupportActionError("assignment_clear_ticket_update", error, {
      ticketId: ticket.id,
      organisationId: ticket.organisation_id,
      actorProfileId: profileId,
    });
    redirectToTicket(ticket.id, "assignment_error");
  }

  const { error: eventError } = await insertTicketEvent({
    supabase,
    ticketId: ticket.id,
    organisationId: ticket.organisation_id,
    actorProfileId: profileId,
    eventType: "assigned",
    eventSummary: "Ticket assignment cleared",
    visibility: "internal",
    fromValue: ticket.assigned_to_profile_id,
    toValue: null,
  });

  logSupportActionError("assignment_clear_event_insert", eventError, {
    ticketId: ticket.id,
    organisationId: ticket.organisation_id,
    actorProfileId: profileId,
  });

  revalidatePlatformSupportPaths(ticket.id);
  redirectToTicket(
    ticket.id,
    eventError ? "assignment_event_error" : "assignment_cleared",
  );
}

export async function addPlatformSupportReplyAction(formData: FormData) {
  const { profileId } = await requirePlatformSupportAccess();
  const ticketId = getString(formData, "ticket_id");
  const body = getString(formData, "body");
  const ticket = await getTicketForAction(ticketId);

  if (!ticket) {
    redirectToTicket(ticketId, "invalid_ticket");
  }

  if (body.length < 2) {
    redirectToTicket(ticket.id, "invalid_reply");
  }

  const now = new Date().toISOString();
  const supabase = await createClient();
  const { error: commentError } = await insertTicketComment({
    supabase,
    ticketId: ticket.id,
    organisationId: ticket.organisation_id,
    authorProfileId: profileId,
    body,
    visibility: "customer",
  });

  if (commentError) {
    logSupportActionError("reply_comment_insert", commentError, {
      ticketId: ticket.id,
      organisationId: ticket.organisation_id,
      actorProfileId: profileId,
    });
    redirectToTicket(ticket.id, "reply_error");
  }

  const { error: eventError } = await insertTicketEvent({
    supabase,
    ticketId: ticket.id,
    organisationId: ticket.organisation_id,
    actorProfileId: profileId,
    eventType: "comment_added",
    eventSummary: "Support reply added",
    visibility: "customer",
  });

  if (eventError) {
    logSupportActionError("reply_event_insert", eventError, {
      ticketId: ticket.id,
      organisationId: ticket.organisation_id,
      actorProfileId: profileId,
    });
    revalidatePlatformSupportPaths(ticket.id);
    redirectToTicket(ticket.id, "reply_event_error");
  }

  const { error: ticketUpdateError } = await supabase
    .from("support_tickets")
    .update({
      support_last_activity_at: now,
      updated_at: now,
      status: "waiting_on_customer",
    })
    .eq("id", ticket.id)
    .in("status", ["open", "waiting_on_support"]);

  if (ticketUpdateError) {
    logSupportActionError("reply_ticket_update", ticketUpdateError, {
      ticketId: ticket.id,
      organisationId: ticket.organisation_id,
      actorProfileId: profileId,
    });
    revalidatePlatformSupportPaths(ticket.id);
    redirectToTicket(ticket.id, "reply_ticket_update_error");
  }

  revalidatePlatformSupportPaths(ticket.id);
  redirectToTicket(ticket.id, "reply_added");
}

export async function addPlatformInternalNoteAction(formData: FormData) {
  const { profileId } = await requirePlatformSupportAccess();
  const ticketId = getString(formData, "ticket_id");
  const body = getString(formData, "body");
  const ticket = await getTicketForAction(ticketId);

  if (!ticket) {
    redirectToTicket(ticketId, "invalid_ticket");
  }

  if (body.length < 2) {
    redirectToTicket(ticket.id, "invalid_internal_note");
  }

  const now = new Date().toISOString();
  const supabase = await createClient();
  const { error: commentError } = await insertTicketComment({
    supabase,
    ticketId: ticket.id,
    organisationId: ticket.organisation_id,
    authorProfileId: profileId,
    body,
    visibility: "internal",
  });

  if (commentError) {
    logSupportActionError("internal_note_comment_insert", commentError, {
      ticketId: ticket.id,
      organisationId: ticket.organisation_id,
      actorProfileId: profileId,
    });
    redirectToTicket(ticket.id, "internal_note_error");
  }

  const { error: eventError } = await insertTicketEvent({
    supabase,
    ticketId: ticket.id,
    organisationId: ticket.organisation_id,
    actorProfileId: profileId,
    eventType: "internal_note_added",
    eventSummary: "Internal note added",
    visibility: "internal",
  });

  if (eventError) {
    logSupportActionError("internal_note_event_insert", eventError, {
      ticketId: ticket.id,
      organisationId: ticket.organisation_id,
      actorProfileId: profileId,
    });
    revalidatePlatformSupportPaths(ticket.id);
    redirectToTicket(ticket.id, "internal_note_event_error");
  }

  const { error: ticketUpdateError } = await supabase
    .from("support_tickets")
    .update({
      support_last_activity_at: now,
      updated_at: now,
    })
    .eq("id", ticket.id);

  if (ticketUpdateError) {
    logSupportActionError("internal_note_ticket_update", ticketUpdateError, {
      ticketId: ticket.id,
      organisationId: ticket.organisation_id,
      actorProfileId: profileId,
    });
    revalidatePlatformSupportPaths(ticket.id);
    redirectToTicket(ticket.id, "internal_note_ticket_update_error");
  }

  revalidatePlatformSupportPaths(ticket.id);
  redirectToTicket(ticket.id, "internal_note_added");
}
