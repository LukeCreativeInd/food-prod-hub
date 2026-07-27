export type FormulaImportSourceType =
  | "component_batch_formulas"
  | "finished_product_formulas"
  | "production_methods_routes"
  | "production_areas"
  | "examples_and_notes";

export type FormulaImportStage =
  | "upload_source_file"
  | "parse_tabs"
  | "normalise_rows"
  | "group_formulas"
  | "match_items"
  | "validate_records"
  | "review_summary"
  | "commit_drafts"
  | "post_commit_review";

export type FormulaImportEntityType =
  | "component_formula"
  | "finished_product_formula"
  | "formula_line"
  | "production_method"
  | "production_area";

export type FormulaImportSeverity = "info" | "warning" | "error" | "blocker";

export type FormulaImportColumnMapping = {
  sourceType: FormulaImportSourceType;
  sourceColumn: string;
  targetEntity: FormulaImportEntityType;
  targetField: string;
  required: boolean;
  notes: string;
};

export type FormulaImportValidationRule = {
  key: string;
  severity: FormulaImportSeverity;
  entityType: FormulaImportEntityType;
  description: string;
};

export type FormulaImportReviewStep = {
  key: string;
  label: string;
  description: string;
};

export type FormulaImportPlan = {
  stages: {
    key: FormulaImportStage;
    label: string;
    description: string;
  }[];
  columnMappings: FormulaImportColumnMapping[];
  validationRules: FormulaImportValidationRule[];
  reviewSteps: FormulaImportReviewStep[];
};

export const formulaImportStages: FormulaImportPlan["stages"] = [
  {
    key: "upload_source_file",
    label: "Upload source file",
    description: "Future upload of the reviewed Clean Eats workbook or CSV pack.",
  },
  {
    key: "parse_tabs",
    label: "Parse workbook or CSV tabs",
    description: "Read component, finished product, method and area sheets.",
  },
  {
    key: "normalise_rows",
    label: "Normalise rows",
    description: "Trim names, normalise units and detect example-only rows.",
  },
  {
    key: "group_formulas",
    label: "Group formula headers and lines",
    description: "Group repeated row inputs into component or finished product formulas.",
  },
  {
    key: "match_items",
    label: "Match items",
    description: "Match source names to internal items, components and packaging.",
  },
  {
    key: "validate_records",
    label: "Validate records",
    description: "Check required fields, units, duplicates, self-reference and ambiguity.",
  },
  {
    key: "review_summary",
    label: "Review import summary",
    description: "Let a reviewer resolve warnings before any commit action exists.",
  },
  {
    key: "commit_drafts",
    label: "Commit draft formulas",
    description: "Future action to create draft formula versions and lines after approval.",
  },
  {
    key: "post_commit_review",
    label: "Post-commit review",
    description: "Show created records, deferred rows and remaining follow-up issues.",
  },
];

export const componentFormulaColumnMappings: FormulaImportColumnMapping[] = [
  {
    sourceType: "component_batch_formulas",
    sourceColumn: "Component name",
    targetEntity: "component_formula",
    targetField: "internal_items.display_name / formula_versions.output_internal_item_id",
    required: true,
    notes: "Creates or matches a component internal item after review.",
  },
  {
    sourceType: "component_batch_formulas",
    sourceColumn: "Component category/type",
    targetEntity: "component_formula",
    targetField: "internal_items.notes",
    required: false,
    notes: "Useful context; current formula schema has no category column.",
  },
  {
    sourceType: "component_batch_formulas",
    sourceColumn: "Version/status",
    targetEntity: "component_formula",
    targetField: "formula_versions.status",
    required: true,
    notes: "Example-only rows should not import by default; reviewed imports should start as draft.",
  },
  {
    sourceType: "component_batch_formulas",
    sourceColumn: "Standard batch output quantity",
    targetEntity: "component_formula",
    targetField: "formula_versions.output_quantity",
    required: true,
    notes: "Required by current schema.",
  },
  {
    sourceType: "component_batch_formulas",
    sourceColumn: "Output unit",
    targetEntity: "component_formula",
    targetField: "formula_versions.output_unit",
    required: true,
    notes: "Required by current schema.",
  },
  {
    sourceType: "component_batch_formulas",
    sourceColumn: "Expected yield quantity",
    targetEntity: "component_formula",
    targetField: "formula_versions.expected_yield_quantity",
    required: false,
    notes: "Optional current schema field.",
  },
  {
    sourceType: "component_batch_formulas",
    sourceColumn: "Expected yield unit",
    targetEntity: "component_formula",
    targetField: "formula_versions.expected_yield_unit",
    required: false,
    notes: "Optional current schema field.",
  },
  {
    sourceType: "component_batch_formulas",
    sourceColumn: "Input item name",
    targetEntity: "formula_line",
    targetField: "formula_lines.input_internal_item_id",
    required: true,
    notes: "Must resolve to an internal item before commit.",
  },
  {
    sourceType: "component_batch_formulas",
    sourceColumn: "Input quantity",
    targetEntity: "formula_line",
    targetField: "formula_lines.quantity",
    required: true,
    notes: "Must be positive.",
  },
  {
    sourceType: "component_batch_formulas",
    sourceColumn: "Input unit",
    targetEntity: "formula_line",
    targetField: "formula_lines.unit",
    required: true,
    notes: "Must be present and supported.",
  },
  {
    sourceType: "component_batch_formulas",
    sourceColumn: "Preparation state",
    targetEntity: "formula_line",
    targetField: "formula_lines.preparation_state",
    required: false,
    notes: "Optional current schema field.",
  },
  {
    sourceType: "component_batch_formulas",
    sourceColumn: "Loss/yield notes",
    targetEntity: "formula_line",
    targetField: "formula_lines.loss_note",
    required: false,
    notes: "Optional current schema field.",
  },
];

export const finishedProductFormulaColumnMappings: FormulaImportColumnMapping[] = [
  {
    sourceType: "finished_product_formulas",
    sourceColumn: "Finished product name",
    targetEntity: "finished_product_formula",
    targetField: "internal_items.display_name / formula_versions.output_internal_item_id",
    required: true,
    notes: "Creates or matches a finished product internal item after review.",
  },
  {
    sourceType: "finished_product_formulas",
    sourceColumn: "Product/SKU type",
    targetEntity: "finished_product_formula",
    targetField: "internal_items.notes",
    required: false,
    notes: "Useful context; current formula schema has no SKU type column.",
  },
  {
    sourceType: "finished_product_formulas",
    sourceColumn: "Selling unit",
    targetEntity: "finished_product_formula",
    targetField: "formula_versions.output_unit",
    required: true,
    notes: "Maps to the formula output unit.",
  },
  {
    sourceType: "finished_product_formulas",
    sourceColumn: "Output quantity",
    targetEntity: "finished_product_formula",
    targetField: "formula_versions.output_quantity",
    required: true,
    notes: "Required by current schema.",
  },
  {
    sourceType: "finished_product_formulas",
    sourceColumn: "Input item/component/packaging name",
    targetEntity: "formula_line",
    targetField: "formula_lines.input_internal_item_id",
    required: true,
    notes: "Must resolve to an internal item or component before commit.",
  },
  {
    sourceType: "finished_product_formulas",
    sourceColumn: "Quantity per selling unit",
    targetEntity: "formula_line",
    targetField: "formula_lines.quantity",
    required: true,
    notes: "Must be positive.",
  },
  {
    sourceType: "finished_product_formulas",
    sourceColumn: "Unit",
    targetEntity: "formula_line",
    targetField: "formula_lines.unit",
    required: true,
    notes: "Must be present and supported.",
  },
  {
    sourceType: "finished_product_formulas",
    sourceColumn: "Optional garnish/label/packaging note",
    targetEntity: "formula_line",
    targetField: "formula_lines.notes",
    required: false,
    notes: "Useful context for packaging or optional lines.",
  },
];

export const productionMethodColumnMappings: FormulaImportColumnMapping[] = [
  {
    sourceType: "production_methods_routes",
    sourceColumn: "Item/component/product name",
    targetEntity: "production_method",
    targetField: "future production route reference",
    required: true,
    notes: "Future method/route schema is not created yet.",
  },
  {
    sourceType: "production_methods_routes",
    sourceColumn: "Step number",
    targetEntity: "production_method",
    targetField: "future route step order",
    required: true,
    notes: "Future method/route schema is not created yet.",
  },
  {
    sourceType: "production_methods_routes",
    sourceColumn: "Facility area",
    targetEntity: "production_method",
    targetField: "future route area reference",
    required: true,
    notes: "Should match production areas or inventory locations after review.",
  },
  {
    sourceType: "production_methods_routes",
    sourceColumn: "Step instruction",
    targetEntity: "production_method",
    targetField: "future route instruction",
    required: true,
    notes: "Do not import into formula_lines.",
  },
];

export const productionAreaColumnMappings: FormulaImportColumnMapping[] = [
  {
    sourceType: "production_areas",
    sourceColumn: "Area name",
    targetEntity: "production_area",
    targetField: "future production area / inventory_locations display name",
    required: true,
    notes: "Current import plan should match areas for review only.",
  },
  {
    sourceType: "production_areas",
    sourceColumn: "Area type",
    targetEntity: "production_area",
    targetField: "future production area type",
    required: true,
    notes: "Potentially aligns with inventory location types later.",
  },
  {
    sourceType: "production_areas",
    sourceColumn: "Active yes/no",
    targetEntity: "production_area",
    targetField: "future status",
    required: true,
    notes: "Should be reviewed before any production area write action exists.",
  },
];

export const formulaImportValidationRules: FormulaImportValidationRule[] = [
  {
    key: "formula_name_required",
    severity: "blocker",
    entityType: "component_formula",
    description: "Formula name is required before rows can be grouped.",
  },
  {
    key: "output_quantity_required",
    severity: "blocker",
    entityType: "component_formula",
    description: "Output quantity must be present and greater than zero.",
  },
  {
    key: "line_item_required",
    severity: "blocker",
    entityType: "formula_line",
    description: "Every formula line needs an input item name.",
  },
  {
    key: "line_quantity_required",
    severity: "blocker",
    entityType: "formula_line",
    description: "Every formula line needs a positive quantity.",
  },
  {
    key: "line_unit_required",
    severity: "blocker",
    entityType: "formula_line",
    description: "Every formula line needs a supported unit.",
  },
  {
    key: "unknown_item_requires_review",
    severity: "warning",
    entityType: "formula_line",
    description: "Unknown input items require reviewer matching before commit.",
  },
  {
    key: "self_reference_blocked",
    severity: "blocker",
    entityType: "formula_line",
    description: "A formula line cannot reference the formula output item.",
  },
  {
    key: "circular_component_reference_blocked",
    severity: "blocker",
    entityType: "component_formula",
    description: "Component circular references must be blocked before commit.",
  },
  {
    key: "unsupported_unit_flagged",
    severity: "warning",
    entityType: "formula_line",
    description: "Unsupported or ambiguous units require review; complex conversions are not automatic.",
  },
  {
    key: "sell_price_missing_margin_pending",
    severity: "info",
    entityType: "finished_product_formula",
    description: "Finished products cannot become margin-ready until sell price storage exists.",
  },
];

export const formulaImportReviewSteps: FormulaImportReviewStep[] = [
  {
    key: "confirm_source_scope",
    label: "Confirm source scope",
    description: "Confirm which workbook tabs are being imported and exclude example rows.",
  },
  {
    key: "resolve_item_matches",
    label: "Resolve item matches",
    description: "Review exact, normalised, supplier mapping and manual item matches.",
  },
  {
    key: "review_formula_groups",
    label: "Review formula groups",
    description: "Check formula output item, output quantity, unit and version status.",
  },
  {
    key: "review_validation_issues",
    label: "Review validation issues",
    description: "Resolve blockers before any draft formula commit action runs.",
  },
  {
    key: "approve_draft_commit",
    label: "Approve draft commit",
    description: "Future reviewer approval to create draft formulas and lines.",
  },
];

export const formulaImportPlan: FormulaImportPlan = {
  stages: formulaImportStages,
  columnMappings: [
    ...componentFormulaColumnMappings,
    ...finishedProductFormulaColumnMappings,
    ...productionMethodColumnMappings,
    ...productionAreaColumnMappings,
  ],
  validationRules: formulaImportValidationRules,
  reviewSteps: formulaImportReviewSteps,
};
