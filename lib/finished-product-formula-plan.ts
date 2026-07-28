export type FinishedProductFormulaStage =
  | "select_finished_product"
  | "edit_formula_header"
  | "add_formula_lines"
  | "review_costing_readiness"
  | "review_margin_readiness"
  | "save_draft"
  | "activate_reviewed_version";

export type FinishedProductLineType =
  | "component"
  | "ingredient"
  | "packaging"
  | "internal_item";

export type FinishedProductReferenceType =
  | "internal_items.finished_product_output"
  | "internal_items.component_input"
  | "internal_items.ingredient_input"
  | "internal_items.packaging_input"
  | "formula_versions.component_cost_source"
  | "approved_supplier_prices.raw_or_packaging_cost_source";

export type FinishedProductValidationRuleSeverity =
  | "info"
  | "warning"
  | "error"
  | "blocker";

export type FinishedProductValidationRule = {
  key: string;
  severity: FinishedProductValidationRuleSeverity;
  appliesTo: "header" | "line" | "formula" | "margin";
  description: string;
};

export type FinishedProductReadinessRule = {
  key: string;
  category: "costing" | "margin";
  requiredForReady: boolean;
  description: string;
};

export type FinishedProductMarginReadinessStatus =
  | "not_ready"
  | "cost_ready_sell_price_missing"
  | "ready_for_margin_review";

export type FinishedProductBuilderPlan = {
  stages: {
    key: FinishedProductFormulaStage;
    label: string;
    description: string;
  }[];
  lineTypes: {
    key: FinishedProductLineType;
    label: string;
    allowedItemTypes: string[];
    description: string;
  }[];
  referenceTypes: {
    key: FinishedProductReferenceType;
    description: string;
  }[];
  validationRules: FinishedProductValidationRule[];
  readinessRules: FinishedProductReadinessRule[];
};

export const finishedProductBuilderStages: FinishedProductBuilderPlan["stages"] =
  [
    {
      key: "select_finished_product",
      label: "Select finished product",
      description:
        "Choose or create a tenant-scoped internal item with item_type finished_product.",
    },
    {
      key: "edit_formula_header",
      label: "Edit formula header",
      description:
        "Capture version name, status, output quantity, output unit, expected yield and notes.",
    },
    {
      key: "add_formula_lines",
      label: "Add formula lines",
      description:
        "Reference component, ingredient and packaging internal items with per-selling-unit quantities.",
    },
    {
      key: "review_costing_readiness",
      label: "Review costing readiness",
      description:
        "Check every line has a safe cost source before showing estimated product cost.",
    },
    {
      key: "review_margin_readiness",
      label: "Review margin readiness",
      description:
        "Keep margin pending until formula cost, sell price, pack size and margin rules are ready.",
    },
    {
      key: "save_draft",
      label: "Save draft",
      description:
        "Future write action should save drafts only after tenant and permission validation.",
    },
    {
      key: "activate_reviewed_version",
      label: "Activate reviewed version",
      description:
        "Future activation should respect the one-active-formula-per-output constraint.",
    },
  ];

export const finishedProductLineTypes: FinishedProductBuilderPlan["lineTypes"] =
  [
    {
      key: "component",
      label: "Component",
      allowedItemTypes: ["component"],
      description:
        "Made or batch item with its own component formula, such as cooked protein, sauce or mash.",
    },
    {
      key: "ingredient",
      label: "Ingredient",
      allowedItemTypes: ["ingredient"],
      description:
        "Raw or purchased internal ingredient costed from approved supplier prices.",
    },
    {
      key: "packaging",
      label: "Packaging",
      allowedItemTypes: ["packaging"],
      description:
        "Packaging item such as tray, film, sleeve, lid or label when BOM support is enabled.",
    },
    {
      key: "internal_item",
      label: "Other internal item",
      allowedItemTypes: ["consumable", "equipment"],
      description:
        "Allowed only with review; useful for future controlled non-stock or operational inputs.",
    },
  ];

export const finishedProductReferenceTypes: FinishedProductBuilderPlan["referenceTypes"] =
  [
    {
      key: "internal_items.finished_product_output",
      description:
        "Finished product formula output uses formula_versions.output_internal_item_id pointing to an internal item.",
    },
    {
      key: "internal_items.component_input",
      description:
        "Component lines use formula_lines.input_internal_item_id pointing to a component internal item.",
    },
    {
      key: "internal_items.ingredient_input",
      description:
        "Ingredient lines use formula_lines.input_internal_item_id pointing to an ingredient internal item.",
    },
    {
      key: "internal_items.packaging_input",
      description:
        "Packaging lines use formula_lines.input_internal_item_id pointing to a packaging internal item.",
    },
    {
      key: "formula_versions.component_cost_source",
      description:
        "Component line cost should come from the selected component formula when it is cost-ready.",
    },
    {
      key: "approved_supplier_prices.raw_or_packaging_cost_source",
      description:
        "Ingredient and packaging line cost should come from current approved supplier prices.",
    },
  ];

export const finishedProductValidationRules: FinishedProductValidationRule[] = [
  {
    key: "finished_product_name_required",
    severity: "blocker",
    appliesTo: "header",
    description: "Finished product name is required.",
  },
  {
    key: "output_quantity_positive",
    severity: "blocker",
    appliesTo: "header",
    description: "Output quantity must be present and greater than zero.",
  },
  {
    key: "output_unit_required",
    severity: "blocker",
    appliesTo: "header",
    description: "Output unit is required, for example each, meal or unit.",
  },
  {
    key: "output_item_tenant_scoped",
    severity: "blocker",
    appliesTo: "header",
    description: "Output internal item must belong to the current organisation.",
  },
  {
    key: "line_input_required",
    severity: "blocker",
    appliesTo: "line",
    description: "Every formula line needs a selected internal item input.",
  },
  {
    key: "line_quantity_positive",
    severity: "blocker",
    appliesTo: "line",
    description: "Line quantity must be present and greater than zero.",
  },
  {
    key: "line_unit_required",
    severity: "blocker",
    appliesTo: "line",
    description: "Line unit is required.",
  },
  {
    key: "line_input_tenant_scoped",
    severity: "blocker",
    appliesTo: "line",
    description: "Line input internal item must belong to the current organisation.",
  },
  {
    key: "self_reference_blocked",
    severity: "blocker",
    appliesTo: "formula",
    description: "A finished product formula cannot reference its own output item.",
  },
  {
    key: "circular_reference_blocked",
    severity: "blocker",
    appliesTo: "formula",
    description: "Finished product and component circular references must be blocked.",
  },
  {
    key: "component_formula_cost_ready",
    severity: "warning",
    appliesTo: "line",
    description:
      "Component inputs should have a cost-ready component formula before product cost is ready.",
  },
  {
    key: "raw_or_packaging_price_ready",
    severity: "warning",
    appliesTo: "line",
    description:
      "Ingredient and packaging inputs need current approved supplier prices in supported units.",
  },
  {
    key: "sell_price_missing",
    severity: "info",
    appliesTo: "margin",
    description:
      "Margin remains pending until reliable sell price storage and agreed margin rules exist.",
  },
];

export const finishedProductCostingReadinessRules: FinishedProductReadinessRule[] =
  [
    {
      key: "all_lines_have_inputs",
      category: "costing",
      requiredForReady: true,
      description: "Every active line has a visible tenant-scoped input item.",
    },
    {
      key: "all_lines_have_positive_quantities",
      category: "costing",
      requiredForReady: true,
      description: "Every active line has a positive quantity and unit.",
    },
    {
      key: "component_inputs_are_cost_ready",
      category: "costing",
      requiredForReady: true,
      description:
        "Component lines use cost-ready component formulas before finished product cost is safe.",
    },
    {
      key: "raw_and_packaging_prices_are_approved",
      category: "costing",
      requiredForReady: true,
      description:
        "Ingredient and packaging lines have current approved supplier prices.",
    },
    {
      key: "unit_matching_or_supported_conversion",
      category: "costing",
      requiredForReady: true,
      description:
        "Units must match exactly or use a reviewed supported conversion rule.",
    },
    {
      key: "archived_lines_excluded",
      category: "costing",
      requiredForReady: true,
      description: "Archived formula lines are excluded from cost readiness.",
    },
  ];

export const finishedProductMarginReadinessRules: FinishedProductReadinessRule[] =
  [
    {
      key: "formula_cost_ready",
      category: "margin",
      requiredForReady: true,
      description: "Finished product formula cost must be safe and complete.",
    },
    {
      key: "sell_price_available",
      category: "margin",
      requiredForReady: true,
      description: "Reliable sell price storage is required before margin can be shown.",
    },
    {
      key: "pack_size_confirmed",
      category: "margin",
      requiredForReady: true,
      description:
        "Pack size or serving quantity must be known when it affects sell price or cost.",
    },
    {
      key: "tax_handling_confirmed",
      category: "margin",
      requiredForReady: true,
      description: "GST/tax handling must be agreed before final margin reporting.",
    },
    {
      key: "margin_formula_agreed",
      category: "margin",
      requiredForReady: true,
      description: "The margin formula must be agreed before showing margin percentages.",
    },
  ];

export const finishedProductBuilderPlan: FinishedProductBuilderPlan = {
  stages: finishedProductBuilderStages,
  lineTypes: finishedProductLineTypes,
  referenceTypes: finishedProductReferenceTypes,
  validationRules: finishedProductValidationRules,
  readinessRules: [
    ...finishedProductCostingReadinessRules,
    ...finishedProductMarginReadinessRules,
  ],
};
