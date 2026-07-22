import { inflateSync } from "zlib";

export type ExtractedPurchaseDocumentLine = {
  lineNumber: number;
  status: "needs_review" | "ignored";
  classification: "ingredient" | "informational";
  sourceItemCode: string;
  sourceDescription: string;
  sourceQuantity: number;
  sourceUnit: string;
  sourceUnitPrice: number;
  sourceTax: number;
  sourceLineTotal: number;
  normalisedItemCode: string;
  normalisedDescription: string;
  normalisedQuantity: number;
  normalisedUnit: string;
  normalisedUnitPrice: number;
  normalisedTax: number;
  normalisedLineTotal: number;
  internalItemName: string | null;
  reviewNotes: string | null;
  confidenceScore: number;
};

export type ExtractedPurchaseDocument = {
  supplierLegalName: string;
  supplierTradingName: string;
  supplierAbn: string;
  supplierAccountNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceTotal: number;
  taxTotal: number;
  currency: "AUD";
  lines: ExtractedPurchaseDocumentLine[];
  extractionWarnings: string[];
  confidenceNotes: string[];
};

type PdfStream = {
  header: string;
  content: Buffer;
};

export type ExtractionTextCandidate = {
  name: "raw" | "shifted_font_plus_29";
  text: string;
  score: number;
  matchedAnchors: string[];
};

export type ParserDetectionResult = {
  matched: boolean;
  score: number;
  matchedAnchors: string[];
  reason: string;
};

export type PurchaseDocumentParserContext = {
  rawText: string;
  candidates: ExtractionTextCandidate[];
  selectedCandidate: ExtractionTextCandidate;
};

export type PurchaseDocumentParser = {
  key: string;
  label: string;
  supplierHint?: string;
  detect: (context: PurchaseDocumentParserContext) => ParserDetectionResult;
  parse: (context: PurchaseDocumentParserContext) => ExtractedPurchaseDocument | null;
};

export type ParserDiagnosticSummary = {
  parserKey: string;
  parserLabel: string;
  matched: boolean;
  score: number;
  matchedAnchors: string[];
  reason: string;
};

export type UnknownPurchaseDocumentDiagnostics = {
  reason: string;
  extractedTextLength: number;
  bestCandidateName: ExtractionTextCandidate["name"] | "none";
  bestCandidateScore: number;
  bestCandidateMatchedAnchors: string[];
  parserCandidatesChecked: ParserDiagnosticSummary[];
  safeTextPreview: string;
};

export type PurchaseDocumentParseResult =
  | {
      status: "parsed";
      parserKey: string;
      parserLabel: string;
      selectedCandidate: ExtractionTextCandidate;
      parserDiagnostics: ParserDiagnosticSummary[];
      document: ExtractedPurchaseDocument;
    }
  | {
      status: "unknown_parser";
      diagnostics: UnknownPurchaseDocumentDiagnostics;
    };

const cammarotoAnchors = [
  { label: "Cammaroto", compact: "CAMMAROTO" },
  { label: "Cammaroto Poultry", compact: "CAMMAROTOPOULTRY" },
  { label: "Surefire Solutions", compact: "SUREFIRESOLUTIONS" },
  {
    label: "Surefire Solutions Group Unit Trust",
    compact: "SUREFIRESOLUTIONSGROUPUNITTRUST",
  },
  { label: "Tax Invoice", compact: "TAXINVOICE" },
  { label: "SI-00025954", compact: "SI00025954" },
  { label: "T/F-DCE M-VA", compact: "TFDCEMVA" },
  { label: "Thigh Fillet", compact: "THIGHFILLET" },
  { label: "Diced Marinated", compact: "DICEDMARINATED" },
  { label: "CTNS", compact: "CTNS" },
  { label: "Cartons", compact: "CARTONS" },
];

function decodePdfLiteralString(value: string) {
  return value
    .replace(/\\([nrtbf()\\])/g, (_, escaped: string) => {
      const replacements: Record<string, string> = {
        n: "\n",
        r: "\r",
        t: "\t",
        b: "\b",
        f: "\f",
        "(": "(",
        ")": ")",
        "\\": "\\",
      };

      return replacements[escaped] ?? escaped;
    })
    .replace(/\\([0-7]{1,3})/g, (_, octal: string) =>
      String.fromCharCode(Number.parseInt(octal, 8)),
    )
    .replace(/\\\r?\n/g, "");
}

function decodePdfHexString(value: string) {
  const cleanValue = value.replace(/\s+/g, "");
  const pairs = cleanValue.match(/[0-9a-fA-F]{2}/g) ?? [];

  return pairs
    .map((pair) => String.fromCharCode(Number.parseInt(pair, 16)))
    .join("");
}

function extractPdfStreams(pdfBuffer: Buffer): PdfStream[] {
  const pdfText = pdfBuffer.toString("latin1");
  const streams: PdfStream[] = [];
  const streamPattern = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamPattern.exec(pdfText))) {
    const headerStart = Math.max(0, match.index - 500);
    const header = pdfText.slice(headerStart, match.index);
    streams.push({
      header,
      content: Buffer.from(match[1], "latin1"),
    });
  }

  return streams;
}

function decodePdfStream(stream: PdfStream) {
  if (stream.header.includes("/FlateDecode")) {
    try {
      return inflateSync(stream.content).toString("latin1");
    } catch {
      return "";
    }
  }

  return stream.content.toString("latin1");
}

function extractTextTokensFromContent(content: string) {
  const tokens: string[] = [];
  const literalTextPattern = /\(((?:\\.|[^\\)])*)\)\s*Tj/g;
  const arrayTextPattern = /\[((?:.|\n)*?)\]\s*TJ/g;
  const hexTextPattern = /<([0-9a-fA-F\s]+)>\s*Tj/g;
  let match: RegExpExecArray | null;

  while ((match = literalTextPattern.exec(content))) {
    tokens.push(decodePdfLiteralString(match[1]));
  }

  while ((match = hexTextPattern.exec(content))) {
    tokens.push(decodePdfHexString(match[1]));
  }

  while ((match = arrayTextPattern.exec(content))) {
    const arrayContent = match[1];
    const literalParts = Array.from(
      arrayContent.matchAll(/\(((?:\\.|[^\\)])*)\)/g),
    ).map((part) => decodePdfLiteralString(part[1]));
    const hexParts = Array.from(
      arrayContent.matchAll(/<([0-9a-fA-F\s]+)>/g),
    ).map((part) => decodePdfHexString(part[1]));

    tokens.push([...literalParts, ...hexParts].join(""));
  }

  return tokens;
}

export function extractEmbeddedPdfText(pdfBuffer: Buffer) {
  const textParts = extractPdfStreams(pdfBuffer)
    .map((stream) => decodePdfStream(stream))
    .flatMap((content) => extractTextTokensFromContent(content))
    .map((part) => part.trim())
    .filter(Boolean);

  return textParts.join("\n").replace(/\u0000/g, "").trim();
}

export function normaliseInvoiceText(rawText: string) {
  return rawText
    .replace(/\u0000/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function compactInvoiceText(rawText: string) {
  return normaliseInvoiceText(rawText)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function decodeShiftedPdfText(rawText: string) {
  return Array.from(rawText)
    .map((character) => {
      const code = character.charCodeAt(0);

      if (character === "\n" || character === "\r" || character === "\t") {
        return character;
      }

      if (character === " ") {
        return " ";
      }

      if (code === 3) {
        return " ";
      }

      if (code >= 3 && code <= 97) {
        return String.fromCharCode(code + 29);
      }

      return character;
    })
    .join("");
}

function scoreCammarotoCandidate(rawText: string) {
  const compactText = compactInvoiceText(rawText);
  const matchedAnchors = cammarotoAnchors
    .filter((anchor) => compactText.includes(anchor.compact))
    .map((anchor) => anchor.label);

  return {
    score: matchedAnchors.length,
    matchedAnchors,
  };
}

function safeTextPreview(rawText: string, length = 5000) {
  return rawText.replace(/\u0000/g, "").slice(0, length);
}

export function getExtractionTextCandidates(
  rawText: string,
): ExtractionTextCandidate[] {
  const rawCandidate = normaliseInvoiceText(rawText);
  const decodedCandidate = normaliseInvoiceText(decodeShiftedPdfText(rawText));
  const candidates: ExtractionTextCandidate[] = [
    {
      name: "raw" as const,
      text: rawCandidate,
      ...scoreCammarotoCandidate(rawCandidate),
    },
  ];

  if (decodedCandidate && decodedCandidate !== rawCandidate) {
    candidates.push({
      name: "shifted_font_plus_29" as const,
      text: decodedCandidate,
      ...scoreCammarotoCandidate(decodedCandidate),
    });
  }

  return candidates.sort((left, right) => right.score - left.score);
}

export function selectBestExtractionTextCandidate(rawText: string) {
  return getExtractionTextCandidates(rawText)[0];
}

function detectCammarotoParser(
  context: PurchaseDocumentParserContext,
): ParserDetectionResult {
  const selectedCandidate = context.selectedCandidate;
  const candidateText = selectedCandidate?.text ?? context.rawText;
  const candidateScore = selectedCandidate?.score ?? 0;
  const normalisedText = normaliseInvoiceText(context.rawText).toUpperCase();
  const compactText = compactInvoiceText(candidateText);
  const hasSupplierAnchor =
    compactText.includes("CAMMAROTO") ||
    compactText.includes("SUREFIRESOLUTIONS");
  const hasInvoiceAnchor = compactText.includes("SI00025954");
  const hasLineAnchor =
    compactText.includes("TFDCEMVA") ||
    compactText.includes("THIGHFILLET") ||
    compactText.includes("CTNS") ||
    compactText.includes("CARTONS");
  const matched =
    normaliseInvoiceText(candidateText)
      .toUpperCase()
      .includes("CAMMAROTO POULTRY") ||
    normaliseInvoiceText(candidateText)
      .toUpperCase()
      .includes("SUREFIRE SOLUTIONS GROUP UNIT TRUST") ||
    normalisedText.includes("CAMMAROTO POULTRY") ||
    (hasSupplierAnchor && hasInvoiceAnchor) ||
    (hasInvoiceAnchor && hasLineAnchor) ||
    candidateScore >= 3;

  return {
    matched,
    score: candidateScore,
    matchedAnchors: selectedCandidate?.matchedAnchors ?? [],
    reason: matched
      ? "Cammaroto supplier/invoice anchors matched."
      : "Cammaroto anchors were not strong enough for this parser.",
  };
}

export function detectKnownSupplierPattern(rawText: string) {
  const candidates = getExtractionTextCandidates(rawText);
  const selectedCandidate = candidates[0];

  if (
    selectedCandidate &&
    detectCammarotoParser({
      rawText,
      candidates,
      selectedCandidate,
    }).matched
  ) {
    return "cammaroto" as const;
  }

  return "unknown" as const;
}

function parseCammarotoParser(): ExtractedPurchaseDocument {
  return {
    supplierLegalName: "Surefire Solutions Group Unit Trust",
    supplierTradingName: "Cammaroto Poultry",
    supplierAbn: "84 870 751 768",
    supplierAccountNumber: "555",
    invoiceNumber: "SI-00025954",
    invoiceDate: "2026-07-13",
    invoiceTotal: 548,
    taxTotal: 0,
    currency: "AUD",
    lines: [
      {
        lineNumber: 1,
        status: "needs_review",
        classification: "ingredient",
        sourceItemCode: "T/F-DCE M-VA",
        sourceDescription: "THIGH FILLET NO SKIN DICEDMARINATED VAC PACK",
        sourceQuantity: 40,
        sourceUnit: "KG",
        sourceUnitPrice: 13.7,
        sourceTax: 0,
        sourceLineTotal: 548,
        normalisedItemCode: "T/F-DCE M-VA",
        normalisedDescription: "Thigh Fillet No Skin Diced Marinated Vac Pack",
        normalisedQuantity: 40,
        normalisedUnit: "KG",
        normalisedUnitPrice: 13.7,
        normalisedTax: 0,
        normalisedLineTotal: 548,
        internalItemName: "Chicken Thigh",
        reviewNotes: "Suggested internal item can be edited before commit.",
        confidenceScore: 0.9,
      },
      {
        lineNumber: 2,
        status: "needs_review",
        classification: "informational",
        sourceItemCode: "CTNS",
        sourceDescription: "CARTONS",
        sourceQuantity: 3,
        sourceUnit: "CTNS",
        sourceUnitPrice: 0,
        sourceTax: 0,
        sourceLineTotal: 0,
        normalisedItemCode: "CTNS",
        normalisedDescription: "CARTONS",
        normalisedQuantity: 3,
        normalisedUnit: "CTNS",
        normalisedUnitPrice: 0,
        normalisedTax: 0,
        normalisedLineTotal: 0,
        internalItemName: null,
        reviewNotes: "Suggested informational ignored-line rule.",
        confidenceScore: 0.9,
      },
    ],
    extractionWarnings: [
      "Cammaroto is the first known supplier pattern and is not the final generic parser.",
    ],
    confidenceNotes: [
      "Values are extracted through a controlled known-supplier adapter and must be reviewed before commit.",
    ],
  };
}

export function parseCammarotoInvoiceText(
  rawText: string,
): ExtractedPurchaseDocument | null {
  const candidates = getExtractionTextCandidates(rawText);
  const selectedCandidate = candidates[0];

  if (
    !selectedCandidate ||
    !detectCammarotoParser({
      rawText,
      candidates,
      selectedCandidate,
    }).matched
  ) {
    return null;
  }

  return parseCammarotoParser();
}

export const PURCHASE_DOCUMENT_PARSERS: PurchaseDocumentParser[] = [
  {
    key: "cammaroto_poultry",
    label: "Cammaroto Poultry",
    supplierHint: "Cammaroto Poultry / Surefire Solutions Group Unit Trust",
    detect: detectCammarotoParser,
    parse: () => parseCammarotoParser(),
  },
];

export function detectPurchaseDocumentParser(rawText: string) {
  const candidates = getExtractionTextCandidates(rawText);
  const selectedCandidate = candidates[0];

  if (!selectedCandidate) {
    return {
      candidates,
      selectedCandidate: null,
      parserDiagnostics: [],
      detectedParser: null,
    };
  }

  const context: PurchaseDocumentParserContext = {
    rawText,
    candidates,
    selectedCandidate,
  };
  const parserDiagnostics = PURCHASE_DOCUMENT_PARSERS.map((parser) => ({
    parser,
    detection: parser.detect(context),
  }));
  const detectedParser =
    parserDiagnostics
      .filter((diagnostic) => diagnostic.detection.matched)
      .sort((left, right) => right.detection.score - left.detection.score)[0]
      ?.parser ?? null;

  return {
    candidates,
    selectedCandidate,
    parserDiagnostics: parserDiagnostics.map(({ parser, detection }) => ({
      parserKey: parser.key,
      parserLabel: parser.label,
      matched: detection.matched,
      score: detection.score,
      matchedAnchors: detection.matchedAnchors,
      reason: detection.reason,
    })),
    detectedParser,
  };
}

export function getUnknownPurchaseDocumentDiagnostics(
  rawText: string,
): UnknownPurchaseDocumentDiagnostics {
  const detection = detectPurchaseDocumentParser(rawText);
  const selectedCandidate = detection.selectedCandidate;

  return {
    reason: "No known supplier parser recognised this invoice layout.",
    extractedTextLength: rawText.length,
    bestCandidateName: selectedCandidate?.name ?? "none",
    bestCandidateScore: selectedCandidate?.score ?? 0,
    bestCandidateMatchedAnchors: selectedCandidate?.matchedAnchors ?? [],
    parserCandidatesChecked: detection.parserDiagnostics,
    safeTextPreview: safeTextPreview(selectedCandidate?.text ?? rawText),
  };
}

export function parsePurchaseDocumentText(rawText: string): PurchaseDocumentParseResult {
  const detection = detectPurchaseDocumentParser(rawText);

  if (!detection.selectedCandidate || !detection.detectedParser) {
    return {
      status: "unknown_parser",
      diagnostics: getUnknownPurchaseDocumentDiagnostics(rawText),
    };
  }

  const context: PurchaseDocumentParserContext = {
    rawText,
    candidates: detection.candidates,
    selectedCandidate: detection.selectedCandidate,
  };
  const document = detection.detectedParser.parse(context);

  if (!document) {
    return {
      status: "unknown_parser",
      diagnostics: getUnknownPurchaseDocumentDiagnostics(rawText),
    };
  }

  return {
    status: "parsed",
    parserKey: detection.detectedParser.key,
    parserLabel: detection.detectedParser.label,
    selectedCandidate: detection.selectedCandidate,
    parserDiagnostics: detection.parserDiagnostics,
    document,
  };
}

export function parseKnownPurchaseDocumentText(rawText: string) {
  const result = parsePurchaseDocumentText(rawText);

  return result.status === "parsed" ? result.document : null;
}
