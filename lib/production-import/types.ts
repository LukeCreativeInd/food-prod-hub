export type ProductionImportTargetConcept =
  | "item_master"
  | "formula"
  | "formula_line"
  | "nominal_output"
  | "method"
  | "method_step"
  | "work_instruction"
  | "area_applicability"
  | "batch_envelope"
  | "process_yield_loss"
  | "packaging_context"
  | "processing_input"
  | "qa_link"
  | "equipment_resource"
  | "unresolved_question"
  | "legacy_evidence";

export type ProductionCollectionDatasetKey =
  | "item_register"
  | "formula_headers"
  | "formula_lines"
  | "methods"
  | "method_steps"
  | "work_instructions"
  | "area_applicability"
  | "yield_batch_rules"
  | "packaging_context"
  | "qa_links"
  | "equipment_resources"
  | "exceptions_questions"
  | "signoff_approval";

export type ProductionImportIssueSeverity =
  | "blocker"
  | "warning"
  | "informational";

export type ProductionImportIssueCategory =
  | "source"
  | "parser"
  | "identity"
  | "concept"
  | "field"
  | "provenance"
  | "format"
  | "unsupported"
  | "ambiguity"
  | "conflict";

export type ProductionImportIssue = {
  code: string;
  severity: ProductionImportIssueSeverity;
  category: ProductionImportIssueCategory;
  safe_message: string;
  source_reference?: string;
  field_reference?: string;
};

export type ProductionImportStagedField = {
  field_name: string;
  source_reference: string;
  raw_value: string;
  normalized_value: string | null;
  normalization_status:
    | "preserved"
    | "normalized"
    | "unresolved"
    | "unsupported";
};

export type ProductionImportStagedRecord = {
  source_sheet: string;
  source_row_reference: string;
  collection_key: string | null;
  target_concept: ProductionImportTargetConcept;
  raw_label: string | null;
  raw_fields: Record<string, string>;
  normalized_fields: Record<string, string | null>;
  provenance: {
    dataset_key: ProductionCollectionDatasetKey;
    parser_key: string;
    parser_version: string;
    source_checksum: string;
    source_row_number: number;
  };
  fields: ProductionImportStagedField[];
  issues: ProductionImportIssue[];
};

export type ProductionImportParseResult = {
  parserKey: string;
  parserVersion: string;
  datasetKey: ProductionCollectionDatasetKey;
  sourceChecksum: string;
  records: ProductionImportStagedRecord[];
  issues: ProductionImportIssue[];
  diagnostics: {
    sourceFormat: "csv";
    rowCount: number;
    columnCount: number;
    outputFingerprint: string;
  };
};

export type ProductionImportParserInput = {
  content: string;
  datasetKey: ProductionCollectionDatasetKey;
  sourceChecksum: string;
  expectedByteSize: number;
  expectedMimeType: string;
  mimeType: string;
  filename: string;
};

export type ProductionImportParser = {
  key: string;
  version: string;
  label: string;
  supportedMimeTypes: readonly string[];
  supportedExtensions: readonly string[];
  accepts(input: Pick<ProductionImportParserInput, "mimeType" | "filename">): boolean;
  parse(input: ProductionImportParserInput): ProductionImportParseResult;
};

export type ProductionImportParserSelection =
  | { supported: true; parser: ProductionImportParser }
  | {
      supported: false;
      issue: ProductionImportIssue;
    };
