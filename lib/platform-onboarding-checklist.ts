import {
  getOnboardingChecklistTemplate,
  type OnboardingChecklistCategory,
  type OnboardingChecklistTemplateItem,
  type ProvisioningTemplateKey,
} from "@/lib/platform-provisioning-templates";

export type OnboardingChecklistTemplateKey = ProvisioningTemplateKey;

export type OnboardingChecklistStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "complete"
  | "skipped";

export type OnboardingChecklistItemPreview = {
  key: string;
  label: string;
  description: string;
  category: OnboardingChecklistCategory;
  required: boolean;
  status: OnboardingChecklistStatus;
  moduleDependency: string | null;
};

export type OnboardingChecklistCategoryPreview = {
  category: OnboardingChecklistCategory;
  label: string;
  items: OnboardingChecklistItemPreview[];
  totalItems: number;
  requiredItems: number;
  optionalItems: number;
  completeItems: number;
  blockedItems: number;
};

export type TenantOnboardingChecklistPreview = {
  templateKey: OnboardingChecklistTemplateKey;
  tenant:
    | {
        name: string;
        slug: string;
        status: string;
      }
    | null;
  categories: OnboardingChecklistCategoryPreview[];
  summary: OnboardingChecklistSummary;
};

export type OnboardingChecklistSummary = {
  totalItems: number;
  requiredItems: number;
  optionalItems: number;
  completeItems: number;
  blockedItems: number;
  notStartedItems: number;
};

const categoryLabels: Record<OnboardingChecklistCategory, string> = {
  tenant_setup: "Tenant setup",
  products: "Products",
  inventory: "Inventory",
  production: "Production",
  costings: "Costings",
  qa_compliance: "QA / Compliance",
  launch: "Launch",
};

function toPreviewItem(
  item: OnboardingChecklistTemplateItem,
): OnboardingChecklistItemPreview {
  return {
    key: item.key,
    label: item.label,
    description: item.description,
    category: item.category,
    required: item.required,
    status: "not_started",
    moduleDependency: item.moduleDependency ?? null,
  };
}

export function groupOnboardingChecklistItems(
  items: OnboardingChecklistItemPreview[],
) {
  return items.reduce((groups, item) => {
    const existingItems = groups.get(item.category) ?? [];
    existingItems.push(item);
    groups.set(item.category, existingItems);

    return groups;
  }, new Map<OnboardingChecklistCategory, OnboardingChecklistItemPreview[]>());
}

export function getOnboardingChecklistCategories(
  templateKey: OnboardingChecklistTemplateKey = "foundation_pilot",
): OnboardingChecklistCategoryPreview[] {
  const template = getOnboardingChecklistTemplate();
  const isSupportedTemplate = templateKey !== "custom";
  const items = template.items.map((item) => toPreviewItem(item));
  const groupedItems = groupOnboardingChecklistItems(items);

  if (!isSupportedTemplate) {
    return [];
  }

  return Array.from(groupedItems.entries()).map(([category, categoryItems]) => {
    const requiredItems = categoryItems.filter((item) => item.required).length;
    const completeItems = categoryItems.filter(
      (item) => item.status === "complete",
    ).length;
    const blockedItems = categoryItems.filter(
      (item) => item.status === "blocked",
    ).length;

    return {
      category,
      label: categoryLabels[category],
      items: categoryItems,
      totalItems: categoryItems.length,
      requiredItems,
      optionalItems: categoryItems.length - requiredItems,
      completeItems,
      blockedItems,
    };
  });
}

export function getOnboardingChecklistSummary(
  templateKey: OnboardingChecklistTemplateKey = "foundation_pilot",
): OnboardingChecklistSummary {
  const categories = getOnboardingChecklistCategories(templateKey);
  const items = categories.flatMap((category) => category.items);
  const requiredItems = items.filter((item) => item.required).length;
  const completeItems = items.filter((item) => item.status === "complete").length;
  const blockedItems = items.filter((item) => item.status === "blocked").length;
  const notStartedItems = items.filter(
    (item) => item.status === "not_started",
  ).length;

  return {
    totalItems: items.length,
    requiredItems,
    optionalItems: items.length - requiredItems,
    completeItems,
    blockedItems,
    notStartedItems,
  };
}

export function getChecklistRequiredCounts(
  templateKey: OnboardingChecklistTemplateKey = "foundation_pilot",
) {
  const summary = getOnboardingChecklistSummary(templateKey);

  return {
    requiredItems: summary.requiredItems,
    optionalItems: summary.optionalItems,
  };
}

export function getOnboardingChecklistPreview(
  templateKey: OnboardingChecklistTemplateKey = "foundation_pilot",
): TenantOnboardingChecklistPreview {
  return buildTenantOnboardingPreview({ templateKey });
}

export function buildTenantOnboardingPreview({
  tenant = null,
  templateKey = "foundation_pilot",
}: {
  tenant?: TenantOnboardingChecklistPreview["tenant"];
  templateKey?: OnboardingChecklistTemplateKey;
}): TenantOnboardingChecklistPreview {
  const categories = getOnboardingChecklistCategories(templateKey);

  return {
    templateKey,
    tenant,
    categories,
    summary: getOnboardingChecklistSummary(templateKey),
  };
}
