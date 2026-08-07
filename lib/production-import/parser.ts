import { createHash } from "node:crypto";

import type {
  ProductionCollectionDatasetKey,
  ProductionImportIssue,
  ProductionImportParseResult,
  ProductionImportParser,
  ProductionImportParserInput,
  ProductionImportParserSelection,
  ProductionImportStagedRecord,
  ProductionImportTargetConcept,
} from "./types";

export const PRODUCTION_IMPORT_PARSER_LIMITS = {
  maxCsvBytes: 2 * 1024 * 1024,
  maxRows: 10_000,
  maxColumns: 128,
  maxFieldCharacters: 16_384,
  maxIssues: 2_000,
} as const;

export const PRODUCTION_IMPORT_TARGET_CONCEPTS = [
  "item_master",
  "formula",
  "formula_line",
  "nominal_output",
  "method",
  "method_step",
  "work_instruction",
  "area_applicability",
  "batch_envelope",
  "process_yield_loss",
  "packaging_context",
  "processing_input",
  "qa_link",
  "equipment_resource",
  "unresolved_question",
  "legacy_evidence",
] as const;

export const CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_KEY =
  "clean_eats_production_collection_csv_v1";
export const CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_VERSION = "1.0.0";

const COMMON_HEADERS = [
  "package_version",
  "priority",
  "workflow_status",
  "source_type",
  "source_name",
  "source_date_version",
  "source_location",
  "source_row_reference",
  "submitted_by",
  "submitted_date",
  "operational_owner",
  "reviewed_by",
  "review_date",
  "approval_status",
  "approval_note",
  "evidence_class",
  "evidence_confidence",
  "staff_notes",
] as const;

const COMMON_REQUIRED_HEADERS = [
  "package_version",
  "priority",
  "workflow_status",
  "source_type",
  "source_name",
  "source_row_reference",
  "submitted_by",
  "submitted_date",
  "operational_owner",
  "approval_status",
  "evidence_class",
  "evidence_confidence",
] as const;

type DatasetDefinition = {
  label: string;
  targetConcept:
    | ProductionImportTargetConcept
    | ((row: Record<string, string | null>) => ProductionImportTargetConcept);
  keyField: string;
  requiredHeaders: readonly string[];
  allowedHeaders: readonly string[];
  identityFields: readonly string[];
  numericFields?: readonly string[];
};

const DATASET_DEFINITIONS: Record<
  ProductionCollectionDatasetKey,
  DatasetDefinition
> = {
  item_register: {
    label: "Item Register",
    targetConcept: "item_master",
    keyField: "collection_item_key",
    requiredHeaders: [
      "collection_item_key",
      "current_item_name",
      "item_type",
      "base_uom",
    ],
    allowedHeaders: [
      "collection_item_key",
      "current_item_name",
      "item_type",
      "canonical_match_status",
      "canonical_match_reference",
      "supplier_relevance",
      "base_uom",
      "lifecycle_status",
      "facility_scope",
      "facility_name",
      "aliases",
    ],
    identityFields: ["collection_item_key"],
  },
  formula_headers: {
    label: "Formula Headers",
    targetConcept: "formula",
    keyField: "collection_formula_key",
    requiredHeaders: [
      "collection_formula_key",
      "output_item_key",
      "nominal_output_quantity",
      "nominal_output_uom",
    ],
    allowedHeaders: [
      "collection_formula_key",
      "output_item_key",
      "presentation_name",
      "nominal_output_quantity",
      "nominal_output_uom",
      "current_effective_intent",
      "effective_from",
    ],
    identityFields: ["collection_formula_key"],
    numericFields: ["nominal_output_quantity"],
  },
  formula_lines: {
    label: "Formula Lines",
    targetConcept: "formula_line",
    keyField: "collection_formula_key",
    requiredHeaders: [
      "collection_formula_key",
      "line_sequence",
      "input_item_key",
      "quantity",
      "uom",
    ],
    allowedHeaders: [
      "collection_formula_key",
      "line_sequence",
      "input_item_key",
      "input_classification",
      "quantity",
      "uom",
      "incorporated_material",
      "optional_conditional",
      "packaging_material",
      "packaging_context_key",
      "preparation_state",
      "line_approval_status",
    ],
    identityFields: ["collection_formula_key", "line_sequence"],
    numericFields: ["line_sequence", "quantity"],
  },
  methods: {
    label: "Methods",
    targetConcept: "method",
    keyField: "collection_method_key",
    requiredHeaders: [
      "collection_method_key",
      "output_item_key",
      "method_name",
    ],
    allowedHeaders: [
      "collection_method_key",
      "output_item_key",
      "compatible_formula_key",
      "method_name",
      "facility_scope",
      "facility_names",
      "area_keys",
      "yield_rule_keys",
      "batch_rule_keys",
      "equipment_summary",
    ],
    identityFields: ["collection_method_key"],
  },
  method_steps: {
    label: "Method Steps",
    targetConcept: "method_step",
    keyField: "collection_method_key",
    requiredHeaders: [
      "collection_method_key",
      "step_sequence",
      "step_title",
      "action_category",
    ],
    allowedHeaders: [
      "collection_method_key",
      "step_sequence",
      "step_title",
      "action_category",
      "area_key",
      "equipment_keys",
      "expected_duration",
      "temperature_parameters",
      "time_process_parameters",
      "input_stage",
      "output_stage",
      "qa_required",
      "qa_link_keys",
      "instruction_key",
    ],
    identityFields: ["collection_method_key", "step_sequence"],
    numericFields: ["step_sequence"],
  },
  work_instructions: {
    label: "Work Instructions",
    targetConcept: "work_instruction",
    keyField: "collection_instruction_key",
    requiredHeaders: [
      "collection_instruction_key",
      "title",
      "operator_instruction",
    ],
    allowedHeaders: [
      "collection_instruction_key",
      "title",
      "operator_instruction",
      "linked_method_steps",
      "reuse_scope",
      "facility_scope",
      "area_keys",
      "equipment_keys",
      "safety_training_notes",
      "attachment_required",
      "attachment_reference",
    ],
    identityFields: ["collection_instruction_key"],
  },
  area_applicability: {
    label: "Area & Applicability",
    targetConcept: "area_applicability",
    keyField: "collection_area_key",
    requiredHeaders: [
      "collection_area_key",
      "staff_area_name",
      "facility_scope",
    ],
    allowedHeaders: [
      "collection_area_key",
      "staff_area_name",
      "canonical_match_status",
      "canonical_area_reference",
      "facility_scope",
      "facility_names",
      "area_category",
    ],
    identityFields: ["collection_area_key"],
  },
  yield_batch_rules: {
    label: "Yield & Batch Rules",
    targetConcept: (row) => {
      if (row.rule_category === "yield_loss") return "process_yield_loss";
      if (row.rule_category === "batch_envelope") return "batch_envelope";
      return "legacy_evidence";
    },
    keyField: "collection_rule_key",
    requiredHeaders: [
      "collection_rule_key",
      "method_key",
      "rule_category",
      "expected_value",
      "measure_kind",
      "basis_context",
    ],
    allowedHeaders: [
      "collection_rule_key",
      "method_key",
      "rule_category",
      "yield_loss_type",
      "batch_constraint_type",
      "expected_value",
      "measure_kind",
      "uom",
      "basis_context",
      "equipment_key",
    ],
    identityFields: ["collection_rule_key"],
    numericFields: ["expected_value"],
  },
  packaging_context: {
    label: "Packaging Context",
    targetConcept: "packaging_context",
    keyField: "collection_packaging_context_key",
    requiredHeaders: [
      "collection_packaging_context_key",
      "packaging_item_key",
      "packaging_context",
      "formula_inclusion_direction",
    ],
    allowedHeaders: [
      "collection_packaging_context_key",
      "packaging_item_key",
      "output_item_key",
      "packaging_context",
      "formula_inclusion_direction",
    ],
    identityFields: ["collection_packaging_context_key"],
  },
  qa_links: {
    label: "QA Links",
    targetConcept: "qa_link",
    keyField: "collection_qa_link_key",
    requiredHeaders: [
      "collection_qa_link_key",
      "method_key",
      "step_sequence",
      "check_category",
      "requirement_status",
    ],
    allowedHeaders: [
      "collection_qa_link_key",
      "method_key",
      "step_sequence",
      "check_category",
      "existing_qa_definition_reference",
      "requirement_status",
      "production_reviewed_by",
      "qa_reviewed_by",
    ],
    identityFields: ["collection_qa_link_key"],
    numericFields: ["step_sequence"],
  },
  equipment_resources: {
    label: "Equipment & Resources",
    targetConcept: "equipment_resource",
    keyField: "collection_equipment_key",
    requiredHeaders: [
      "collection_equipment_key",
      "equipment_name",
      "equipment_category",
      "facility_name",
    ],
    allowedHeaders: [
      "collection_equipment_key",
      "equipment_name",
      "equipment_category",
      "facility_name",
      "method_keys",
      "capacity_constraint_evidence",
      "canonical_match_status",
    ],
    identityFields: ["collection_equipment_key"],
  },
  exceptions_questions: {
    label: "Exceptions & Questions",
    targetConcept: "unresolved_question",
    keyField: "collection_question_key",
    requiredHeaders: [
      "collection_question_key",
      "issue_type",
      "raw_source_text",
      "suspected_concepts",
      "question_for_staff",
      "assigned_reviewer",
    ],
    allowedHeaders: [
      "collection_question_key",
      "issue_type",
      "raw_source_text",
      "suspected_concepts",
      "question_for_staff",
      "assigned_reviewer",
      "resolution",
      "resolved_target",
      "resolution_date",
      "conflicting_candidate_references",
      "resolution_rationale",
    ],
    identityFields: ["collection_question_key"],
  },
  signoff_approval: {
    label: "Sign-off & Approval",
    targetConcept: "legacy_evidence",
    keyField: "collection_signoff_key",
    requiredHeaders: [
      "collection_signoff_key",
      "scope",
      "submitter_attestation",
      "domain_reviewer_attestation",
      "final_approval",
    ],
    allowedHeaders: [
      "collection_signoff_key",
      "scope",
      "submitter_attestation",
      "domain_reviewer_attestation",
      "qa_attestation",
      "material_attestation",
      "final_approval",
      "accepted_warning_references",
    ],
    identityFields: ["collection_signoff_key"],
  },
};

const KEY_PATTERNS: Record<string, RegExp> = {
  collection_item_key: /^ITEM-[A-Z0-9][A-Z0-9-]{1,62}$/,
  collection_formula_key: /^FORM-[A-Z0-9][A-Z0-9-]{1,62}$/,
  collection_method_key: /^METHOD-[A-Z0-9][A-Z0-9-]{1,62}$/,
  collection_instruction_key: /^WI-[A-Z0-9][A-Z0-9-]{1,62}$/,
  collection_area_key: /^AREA-[A-Z0-9][A-Z0-9-]{1,62}$/,
  collection_rule_key: /^(?:YIELD|BATCH)-[A-Z0-9][A-Z0-9-]{1,62}$/,
  collection_packaging_context_key: /^PACK-[A-Z0-9][A-Z0-9-]{1,62}$/,
  collection_qa_link_key: /^QA-LINK-[A-Z0-9][A-Z0-9-]{1,62}$/,
  collection_equipment_key: /^EQUIP-[A-Z0-9][A-Z0-9-]{1,62}$/,
  collection_question_key: /^QUESTION-[A-Z0-9][A-Z0-9-]{1,62}$/,
  collection_signoff_key: /^SIGNOFF-[A-Z0-9][A-Z0-9-]{1,62}$/,
};

const DECIMAL_PATTERN = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/;
const FORMULA_PREFIX_PATTERN = /^[=+@]/;

function issue(
  code: string,
  severity: ProductionImportIssue["severity"],
  category: ProductionImportIssue["category"],
  safeMessage: string,
  sourceReference?: string,
  fieldReference?: string,
): ProductionImportIssue {
  return {
    code,
    severity,
    category,
    safe_message: safeMessage,
    ...(sourceReference ? { source_reference: sourceReference } : {}),
    ...(fieldReference ? { field_reference: fieldReference } : {}),
  };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }

  const object = value as Record<string, unknown>;
  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(object[key])}`)
    .join(",")}}`;
}

export function fingerprintProductionImportValue(value: unknown): string {
  return createHash("sha256").update(stableStringify(value), "utf8").digest("hex");
}

export function verifyProductionImportSourceChecksum(
  content: string,
  expectedChecksum: string,
): boolean {
  if (!/^[0-9a-f]{64}$/.test(expectedChecksum)) return false;
  return createHash("sha256").update(content, "utf8").digest("hex") === expectedChecksum;
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];

    if (quoted) {
      if (character === '"' && content[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      if (field.length > 0) throw new Error("csv_quote_not_at_field_start");
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (character === "\r") {
      if (content[index + 1] === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }

    if (field.length > PRODUCTION_IMPORT_PARSER_LIMITS.maxFieldCharacters) {
      throw new Error("csv_field_too_long");
    }
  }

  if (quoted) throw new Error("csv_unclosed_quote");
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((candidate) => candidate.some((value) => value.length > 0));
}

function invalidParserResult(
  input: ProductionImportParserInput,
  code: string,
  message: string,
): ProductionImportParseResult {
  const topLevelIssue = issue(code, "blocker", "format", message);
  return {
    parserKey: CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_KEY,
    parserVersion: CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_VERSION,
    datasetKey: input.datasetKey,
    sourceChecksum: input.sourceChecksum,
    records: [],
    issues: [topLevelIssue],
    diagnostics: {
      sourceFormat: "csv",
      rowCount: 0,
      columnCount: 0,
      outputFingerprint: fingerprintProductionImportValue([topLevelIssue]),
    },
  };
}

function parseCleanEatsProductionCollectionCsv(
  input: ProductionImportParserInput,
): ProductionImportParseResult {
  const actualByteSize = new TextEncoder().encode(input.content).byteLength;

  if (!verifyProductionImportSourceChecksum(input.content, input.sourceChecksum)) {
    return invalidParserResult(
      input,
      "source_checksum_mismatch",
      "The parser input does not match the registered immutable source checksum.",
    );
  }

  if (actualByteSize !== input.expectedByteSize) {
    return invalidParserResult(
      input,
      "source_byte_size_mismatch",
      "The parser input byte size does not match the registered immutable source evidence.",
    );
  }

  if (input.mimeType !== input.expectedMimeType) {
    return invalidParserResult(
      input,
      "source_mime_type_mismatch",
      "The parser input MIME type does not match the registered immutable source evidence.",
    );
  }

  if (actualByteSize > PRODUCTION_IMPORT_PARSER_LIMITS.maxCsvBytes) {
    return invalidParserResult(
      input,
      "csv_parser_size_limit_exceeded",
      "The CSV exceeds the 2 MiB Task 241 parser limit.",
    );
  }

  if (input.content.includes("\0")) {
    return invalidParserResult(
      input,
      "csv_contains_null_byte",
      "The CSV contains an unsupported null byte.",
    );
  }

  let rows: string[][];
  try {
    rows = parseCsv(input.content.replace(/^\uFEFF/, ""));
  } catch (error) {
    const code = error instanceof Error ? error.message : "csv_malformed";
    return invalidParserResult(
      input,
      code,
      "The CSV structure is malformed or exceeds a parser field limit.",
    );
  }

  if (rows.length === 0) {
    return invalidParserResult(input, "csv_empty", "The CSV does not contain a header row.");
  }

  if (rows.length - 1 > PRODUCTION_IMPORT_PARSER_LIMITS.maxRows) {
    return invalidParserResult(
      input,
      "csv_row_limit_exceeded",
      "The CSV exceeds the 10,000 record Task 241 parser limit.",
    );
  }

  const headers = rows[0].map((header) => header.trim());
  if (
    headers.length === 0 ||
    headers.length > PRODUCTION_IMPORT_PARSER_LIMITS.maxColumns ||
    headers.some((header) => !/^[a-z][a-z0-9_]{0,79}$/.test(header)) ||
    new Set(headers).size !== headers.length
  ) {
    return invalidParserResult(
      input,
      "csv_invalid_headers",
      "CSV headers must be unique Task 240 snake_case field names with no more than 128 columns.",
    );
  }

  const definition = DATASET_DEFINITIONS[input.datasetKey];
  const allowedHeaders = new Set([...COMMON_HEADERS, ...definition.allowedHeaders]);
  const requiredHeaders = [...COMMON_REQUIRED_HEADERS, ...definition.requiredHeaders];
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    return invalidParserResult(
      input,
      "csv_required_headers_missing",
      `The ${definition.label} CSV is missing required headers: ${missingHeaders.join(", ")}.`,
    );
  }

  const resultIssues: ProductionImportIssue[] = headers
    .filter((header) => !allowedHeaders.has(header))
    .map((header) =>
      issue(
        "csv_unknown_header_preserved",
        "warning",
        "format",
        `Unrecognised header ${header} was preserved as source evidence and was not interpreted.`,
        definition.label,
        header,
      ),
    );

  const records: ProductionImportStagedRecord[] = [];
  const seenIdentities = new Set<string>();

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const values = rows[rowIndex];
    const sourceRowNumber = rowIndex + 1;
    const rawFields: Record<string, string> = {};
    const normalizedFields: Record<string, string | null> = {};
    const rowIssues: ProductionImportIssue[] = [];

    if (values.length > headers.length) {
      resultIssues.push(
        issue(
          "csv_row_has_extra_columns",
          "blocker",
          "format",
          `CSV row ${sourceRowNumber} has more values than the declared header row.`,
          `${definition.label}:row:${sourceRowNumber}`,
        ),
      );
      continue;
    }

    headers.forEach((header, columnIndex) => {
      const rawValue = values[columnIndex] ?? "";
      rawFields[header] = rawValue;
      normalizedFields[header] = rawValue.trim() || null;
    });

    const suppliedReference = normalizedFields.source_row_reference;
    const sourceReference =
      typeof suppliedReference === "string" && suppliedReference.length > 0
        ? suppliedReference
        : `${definition.label}:row:${sourceRowNumber}`;

    for (const requiredHeader of requiredHeaders) {
      if (!normalizedFields[requiredHeader]) {
        rowIssues.push(
          issue(
            "required_field_missing",
            "blocker",
            "field",
            `Required field ${requiredHeader} is empty.`,
            sourceReference,
            requiredHeader,
          ),
        );
      }
    }

    const collectionKey = normalizedFields[definition.keyField];
    const keyPattern = KEY_PATTERNS[definition.keyField];
    if (
      typeof collectionKey === "string" &&
      keyPattern &&
      !keyPattern.test(collectionKey)
    ) {
      rowIssues.push(
        issue(
          "collection_key_invalid",
          "blocker",
          "identity",
          `The ${definition.keyField} value does not match the controlled Task 240 key format.`,
          sourceReference,
          definition.keyField,
        ),
      );
    }

    for (const numericField of definition.numericFields ?? []) {
      const value = normalizedFields[numericField];
      if (typeof value === "string" && !DECIMAL_PATTERN.test(value)) {
        rowIssues.push(
          issue(
            "numeric_field_malformed",
            "blocker",
            "field",
            `Field ${numericField} is not a valid plain decimal value.`,
            sourceReference,
            numericField,
          ),
        );
      }
    }

    if (
      input.datasetKey === "yield_batch_rules" &&
      !["yield_loss", "batch_envelope"].includes(normalizedFields.rule_category ?? "")
    ) {
      rowIssues.push(
        issue(
          "yield_batch_target_ambiguous",
          "blocker",
          "ambiguity",
          "The rule_category must explicitly identify yield_loss or batch_envelope; the parser did not guess.",
          sourceReference,
          "rule_category",
        ),
      );
    }

    for (const header of headers) {
      const value = rawFields[header];
      if (FORMULA_PREFIX_PATTERN.test(value.trimStart())) {
        rowIssues.push(
          issue(
            "spreadsheet_formula_text_preserved",
            "warning",
            "format",
            `Formula-like text in ${header} was preserved and not executed.`,
            sourceReference,
            header,
          ),
        );
      }
    }

    const identity = definition.identityFields
      .map((fieldName) => normalizedFields[fieldName] ?? "")
      .join("|");
    if (identity && seenIdentities.has(identity)) {
      rowIssues.push(
        issue(
          "duplicate_source_identity",
          "blocker",
          "identity",
          "The CSV repeats the same dataset identity; both rows remain source evidence for review.",
          sourceReference,
        ),
      );
    }
    if (identity) seenIdentities.add(identity);

    const targetConcept =
      typeof definition.targetConcept === "function"
        ? definition.targetConcept(normalizedFields)
        : definition.targetConcept;

    records.push({
      source_sheet: definition.label,
      source_row_reference: sourceReference,
      collection_key: typeof collectionKey === "string" ? collectionKey : null,
      target_concept: targetConcept,
      raw_label:
        normalizedFields.current_item_name ??
        normalizedFields.presentation_name ??
        normalizedFields.method_name ??
        normalizedFields.title ??
        null,
      raw_fields: rawFields,
      normalized_fields: normalizedFields,
      provenance: {
        dataset_key: input.datasetKey,
        parser_key: CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_KEY,
        parser_version: CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_VERSION,
        source_checksum: input.sourceChecksum,
        source_row_number: sourceRowNumber,
      },
      fields: headers.map((header, columnIndex) => ({
        field_name: header,
        source_reference: `${sourceReference}:column:${columnIndex + 1}`,
        raw_value: rawFields[header],
        normalized_value: normalizedFields[header],
        normalization_status:
          rawFields[header] === (normalizedFields[header] ?? "")
            ? "preserved"
            : "normalized",
      })),
      issues: rowIssues,
    });
  }

  const boundedIssueCount =
    resultIssues.length + records.reduce((total, record) => total + record.issues.length, 0);
  if (boundedIssueCount > PRODUCTION_IMPORT_PARSER_LIMITS.maxIssues) {
    return invalidParserResult(
      input,
      "parser_issue_limit_exceeded",
      "The parser stopped because the source would create more than 2,000 safe diagnostics.",
    );
  }

  const outputFingerprint = fingerprintProductionImportValue({
    parserKey: CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_KEY,
    parserVersion: CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_VERSION,
    datasetKey: input.datasetKey,
    sourceChecksum: input.sourceChecksum,
    records,
    issues: resultIssues,
  });

  return {
    parserKey: CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_KEY,
    parserVersion: CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_VERSION,
    datasetKey: input.datasetKey,
    sourceChecksum: input.sourceChecksum,
    records,
    issues: resultIssues,
    diagnostics: {
      sourceFormat: "csv",
      rowCount: records.length,
      columnCount: headers.length,
      outputFingerprint,
    },
  };
}

export const cleanEatsProductionCollectionCsvParser: ProductionImportParser = {
  key: CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_KEY,
  version: CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_VERSION,
  label: "Clean Eats production collection CSV v1",
  supportedMimeTypes: ["text/csv", "application/vnd.ms-excel"],
  supportedExtensions: [".csv"],
  accepts({ mimeType, filename }) {
    return (
      this.supportedMimeTypes.includes(mimeType) &&
      this.supportedExtensions.some((extension) => filename.toLowerCase().endsWith(extension))
    );
  },
  parse: parseCleanEatsProductionCollectionCsv,
};

export const productionImportParserRegistry: readonly ProductionImportParser[] = [
  cleanEatsProductionCollectionCsvParser,
];

export function selectProductionImportParser(
  input: Pick<ProductionImportParserInput, "mimeType" | "filename">,
): ProductionImportParserSelection {
  const parser = productionImportParserRegistry.find((candidate) => candidate.accepts(input));
  if (parser) return { supported: true, parser };

  return {
    supported: false,
    issue: issue(
      "source_format_not_supported",
      "blocker",
      "unsupported",
      "This source can be retained as private evidence, but Task 241 has no deterministic parser for its format.",
    ),
  };
}
