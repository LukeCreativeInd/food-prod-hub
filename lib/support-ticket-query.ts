import {
  isSupportTicketCategory,
  isSupportTicketPriority,
  isSupportTicketStatus,
  type SupportTicketCategory,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "@/lib/support-ticket-types";
import { normaliseSupportModuleKey } from "@/lib/support-ticket-page-context";

export const supportTicketPageSize = 25;
export const supportTicketCustomerPageSize = 25;
export const supportTicketMaxPageSize = 100;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SafeSupportTicketFilters = {
  status: SupportTicketStatus | "all";
  priority: SupportTicketPriority | "all";
  category: SupportTicketCategory | "all";
  organisationId: string | "all";
  moduleKey: string | "all";
  q: string;
  activeQ: string | null;
  qTooShort: boolean;
};

export type SupportTicketPagination = {
  page: number;
  pageSize: number;
  offset: number;
  to: number;
};

export function parseSupportTicketPage(input: string | undefined, pageSize = supportTicketPageSize) {
  const page = Number.parseInt(input ?? "", 10);
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize = Math.min(Math.max(pageSize, 1), supportTicketMaxPageSize);
  const offset = (safePage - 1) * safePageSize;

  return {
    page: safePage,
    pageSize: safePageSize,
    offset,
    to: offset + safePageSize - 1,
  } satisfies SupportTicketPagination;
}

export function parseSupportTicketFilters(params: {
  status?: string;
  priority?: string;
  category?: string;
  organisationId?: string;
  moduleKey?: string;
  q?: string;
}) {
  const q = normaliseSearchQuery(params.q);
  const moduleKey = normaliseSupportModuleKey(params.moduleKey ?? null);

  return {
    status:
      params.status && isSupportTicketStatus(params.status)
        ? params.status
        : "all",
    priority:
      params.priority && isSupportTicketPriority(params.priority)
        ? params.priority
        : "all",
    category:
      params.category && isSupportTicketCategory(params.category)
        ? params.category
        : "all",
    organisationId:
      params.organisationId && uuidPattern.test(params.organisationId)
        ? params.organisationId
        : "all",
    moduleKey: moduleKey ?? "all",
    q: q.displayValue,
    activeQ: q.isActive ? q.searchValue : null,
    qTooShort: q.tooShort,
  } satisfies SafeSupportTicketFilters;
}

export function normaliseSearchQuery(input?: string) {
  const displayValue = input?.trim().replace(/\s+/g, " ").slice(0, 100) ?? "";
  const tooShort = displayValue.length > 0 && displayValue.length < 2;

  return {
    displayValue,
    searchValue: displayValue,
    isActive: displayValue.length >= 2,
    tooShort,
  };
}

export function getSupportTicketIlikePattern(q: string) {
  const safe = q
    .replace(/[\\%_,()]/g, " ")
    .replace(/\s+/g, "%")
    .trim();

  return safe ? `%${safe}%` : "%";
}

export function buildSupportTicketQueryString(
  filters: SafeSupportTicketFilters,
  page?: number,
) {
  const params = new URLSearchParams();

  if (filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.priority !== "all") {
    params.set("priority", filters.priority);
  }

  if (filters.category !== "all") {
    params.set("category", filters.category);
  }

  if (filters.organisationId !== "all") {
    params.set("organisationId", filters.organisationId);
  }

  if (filters.moduleKey !== "all") {
    params.set("moduleKey", filters.moduleKey);
  }

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (page && page > 1) {
    params.set("page", page.toString());
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}
