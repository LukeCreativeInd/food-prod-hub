"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupportTicketOrganisationContext } from "@/lib/support-ticket-context";
import {
  canCustomerCommentOnStatus,
  getNextStatusAfterCustomerComment,
  isSupportTicketCategory,
  isSupportTicketPriority,
  isSupportTicketStatus,
  type SupportTicketStatus,
} from "@/lib/support-ticket-types";
import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getTicketRedirect(status: string, organisationId?: string | null) {
  const params = new URLSearchParams({ ticket: status });

  if (organisationId) {
    params.set("organisationId", organisationId);
  }

  return `/support/tickets?${params.toString()}`;
}

function logSupportTicketActionError(
  action: string,
  error: SupportActionError | null,
  context: Record<string, string | null>,
) {
  if (!error) {
    return;
  }

  console.error("[support-ticket-action]", {
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

async function requireWritableOrganisation(organisationId: string) {
  if (!uuidPattern.test(organisationId)) {
    redirect(getTicketRedirect("invalid_organisation"));
  }

  const context = await getSupportTicketOrganisationContext(organisationId);

  if (!context.profileId) {
    redirect("/login");
  }

  if (!context.selectedOrganisation) {
    redirect(getTicketRedirect("invalid_organisation"));
  }

  return {
    organisation: context.selectedOrganisation,
    profileId: context.profileId,
  };
}

async function getWritableTicketForComment(
  ticketId: string,
  organisationId: string,
) {
  if (!uuidPattern.test(ticketId)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select("id, organisation_id, status")
    .eq("id", ticketId)
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .maybeSingle();

  if (error || !data || !isSupportTicketStatus(data.status)) {
    logSupportTicketActionError("get_comment_ticket", error, {
      ticketId,
      organisationId,
      profileId: null,
    });
    return null;
  }

  return data as {
    id: string;
    organisation_id: string;
    status: SupportTicketStatus;
  };
}

export async function createSupportTicketAction(formData: FormData) {
  const organisationId = getString(formData, "organisation_id");
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const category = getString(formData, "category") || "other";
  const priority = getString(formData, "priority") || "normal";
  const relatedPath = getOptionalString(formData, "related_path");
  const { organisation, profileId } =
    await requireWritableOrganisation(organisationId);

  if (title.length < 3) {
    redirect(getTicketRedirect("invalid_title", organisation.id));
  }

  if (description.length < 10) {
    redirect(getTicketRedirect("invalid_description", organisation.id));
  }

  if (!isSupportTicketCategory(category)) {
    redirect(getTicketRedirect("invalid_category", organisation.id));
  }

  if (!isSupportTicketPriority(priority)) {
    redirect(getTicketRedirect("invalid_priority", organisation.id));
  }

  const now = new Date().toISOString();
  const supabase = await createClient();
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .insert({
      organisation_id: organisation.id,
      created_by_profile_id: profileId,
      title,
      description,
      status: "waiting_on_support",
      priority,
      category,
      source: "support_portal",
      related_path: relatedPath,
      customer_last_activity_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (ticketError || !ticket) {
    logSupportTicketActionError("create_ticket", ticketError, {
      organisationId: organisation.id,
      profileId,
    });
    redirect(getTicketRedirect("create_error", organisation.id));
  }

  const ticketId = ticket.id as string;
  const { error: eventError } = await supabase
    .from("support_ticket_events")
    .insert({
      ticket_id: ticketId,
      organisation_id: organisation.id,
      actor_profile_id: profileId,
      event_type: "created",
      event_summary: "Ticket created and waiting on support",
      visibility: "customer",
      metadata: {},
    });

  revalidatePath("/support");
  revalidatePath("/support/tickets");

  if (eventError) {
    logSupportTicketActionError("create_ticket_event", eventError, {
      ticketId,
      organisationId: organisation.id,
      profileId,
    });
    redirect(`/support/tickets/${ticketId}?ticket=created_event_error`);
  }

  redirect(`/support/tickets/${ticketId}?ticket=created`);
}

export async function addSupportTicketCommentAction(formData: FormData) {
  const ticketId = getString(formData, "ticket_id");
  const organisationId = getString(formData, "organisation_id");
  const body = getString(formData, "body");
  const { organisation, profileId } =
    await requireWritableOrganisation(organisationId);

  const ticket = await getWritableTicketForComment(ticketId, organisation.id);

  if (!ticket) {
    redirect(getTicketRedirect("invalid_ticket", organisation.id));
  }

  if (!canCustomerCommentOnStatus(ticket.status)) {
    redirect(`/support/tickets/${ticket.id}?comment=closed_ticket`);
  }

  if (body.length < 2) {
    redirect(`/support/tickets/${ticket.id}?comment=invalid_body`);
  }

  const now = new Date().toISOString();
  const nextStatus = getNextStatusAfterCustomerComment(ticket.status);
  const statusWillChange = nextStatus !== ticket.status;
  const supabase = await createClient();
  const { error: commentError } = await supabase
    .from("support_ticket_comments")
    .insert({
      ticket_id: ticket.id,
      organisation_id: organisation.id,
      author_profile_id: profileId,
      body,
      visibility: "customer",
      source: "support_portal",
      updated_at: now,
    });

  if (commentError) {
    logSupportTicketActionError("add_customer_comment", commentError, {
      ticketId: ticket.id,
      organisationId: organisation.id,
      profileId,
    });
    redirect(`/support/tickets/${ticket.id}?comment=error`);
  }

  const { error: eventError } = await supabase
    .from("support_ticket_events")
    .insert({
      ticket_id: ticket.id,
      organisation_id: organisation.id,
      actor_profile_id: profileId,
      event_type: "comment_added",
      event_summary: "Customer comment added",
      visibility: "customer",
      metadata: {},
    });

  const { error: ticketUpdateError } = await supabase
    .from("support_tickets")
    .update({
      customer_last_activity_at: now,
      updated_at: now,
      status: nextStatus,
    })
    .eq("id", ticket.id)
    .eq("organisation_id", organisation.id);

  const { error: statusEventError } = statusWillChange
    ? await supabase.from("support_ticket_events").insert({
        ticket_id: ticket.id,
        organisation_id: organisation.id,
        actor_profile_id: profileId,
        event_type: "status_changed",
        event_summary: "Status changed after customer comment",
        visibility: "customer",
        from_value: ticket.status,
        to_value: nextStatus,
        metadata: {},
      })
    : { error: null };

  revalidatePath("/support/tickets");
  revalidatePath(`/support/tickets/${ticket.id}`);

  if (eventError) {
    logSupportTicketActionError("add_customer_comment_event", eventError, {
      ticketId: ticket.id,
      organisationId: organisation.id,
      profileId,
    });
    redirect(`/support/tickets/${ticket.id}?comment=added_event_error`);
  }

  if (ticketUpdateError) {
    logSupportTicketActionError(
      "add_customer_comment_ticket_update",
      ticketUpdateError,
      {
        ticketId: ticket.id,
        organisationId: organisation.id,
        profileId,
      },
    );
    redirect(`/support/tickets/${ticket.id}?comment=ticket_update_error`);
  }

  if (statusEventError) {
    logSupportTicketActionError(
      "add_customer_comment_status_event",
      statusEventError,
      {
        ticketId: ticket.id,
        organisationId: organisation.id,
        profileId,
      },
    );
    redirect(`/support/tickets/${ticket.id}?comment=status_event_error`);
  }

  redirect(`/support/tickets/${ticket.id}?comment=added`);
}
