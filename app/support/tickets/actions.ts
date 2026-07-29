"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupportTicketOrganisationContext } from "@/lib/support-ticket-context";
import {
  isSupportTicketCategory,
  isSupportTicketPriority,
} from "@/lib/support-ticket-types";
import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
      status: "open",
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
      event_summary: "Ticket created",
      visibility: "customer",
      metadata: {},
    });

  revalidatePath("/support");
  revalidatePath("/support/tickets");

  if (eventError) {
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

  if (!uuidPattern.test(ticketId)) {
    redirect(getTicketRedirect("invalid_ticket", organisation.id));
  }

  if (body.length < 2) {
    redirect(`/support/tickets/${ticketId}?comment=invalid_body`);
  }

  const now = new Date().toISOString();
  const supabase = await createClient();
  const { error: commentError } = await supabase
    .from("support_ticket_comments")
    .insert({
      ticket_id: ticketId,
      organisation_id: organisation.id,
      author_profile_id: profileId,
      body,
      visibility: "customer",
      source: "support_portal",
      updated_at: now,
    });

  if (commentError) {
    redirect(`/support/tickets/${ticketId}?comment=error`);
  }

  const { error: eventError } = await supabase
    .from("support_ticket_events")
    .insert({
      ticket_id: ticketId,
      organisation_id: organisation.id,
      actor_profile_id: profileId,
      event_type: "comment_added",
      event_summary: "Customer comment added",
      visibility: "customer",
      metadata: {},
    });

  await supabase
    .from("support_tickets")
    .update({
      customer_last_activity_at: now,
      updated_at: now,
      status: "waiting_on_support",
    })
    .eq("id", ticketId)
    .eq("organisation_id", organisation.id)
    .in("status", ["open", "waiting_on_customer"]);

  revalidatePath("/support/tickets");
  revalidatePath(`/support/tickets/${ticketId}`);

  if (eventError) {
    redirect(`/support/tickets/${ticketId}?comment=added_event_error`);
  }

  redirect(`/support/tickets/${ticketId}?comment=added`);
}
