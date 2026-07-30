export type UnitDimension = "mass" | "volume" | "count" | "unknown";

const unitAliases: Record<string, string> = {
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  g: "g",
  gram: "g",
  grams: "g",
  ml: "ml",
  millilitre: "ml",
  millilitres: "ml",
  milliliter: "ml",
  milliliters: "ml",
  l: "l",
  litre: "l",
  litres: "l",
  liter: "l",
  liters: "l",
  ea: "each",
  each: "each",
  unit: "each",
  units: "each",
};

const dimensionsByUnit: Record<string, UnitDimension> = {
  kg: "mass",
  g: "mass",
  l: "volume",
  ml: "volume",
  each: "count",
};

function cleanUnit(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normaliseUnit(unit: string | null | undefined): string | null {
  if (!unit) {
    return null;
  }

  const cleaned = cleanUnit(unit);

  if (!cleaned) {
    return null;
  }

  return unitAliases[cleaned] ?? cleaned;
}

export function getUnitDimension(unit: string | null | undefined): UnitDimension {
  const normalisedUnit = normaliseUnit(unit);

  if (!normalisedUnit) {
    return "unknown";
  }

  return dimensionsByUnit[normalisedUnit] ?? "unknown";
}

export function canConvertUnit(fromUnit: string, toUnit: string) {
  const normalisedFromUnit = normaliseUnit(fromUnit);
  const normalisedToUnit = normaliseUnit(toUnit);

  if (!normalisedFromUnit || !normalisedToUnit) {
    return false;
  }

  if (normalisedFromUnit === normalisedToUnit) {
    return true;
  }

  const fromDimension = getUnitDimension(normalisedFromUnit);
  const toDimension = getUnitDimension(normalisedToUnit);

  return (
    fromDimension !== "unknown" &&
    fromDimension === toDimension &&
    fromDimension !== "count"
  );
}

export function convertQuantity(
  quantity: number,
  fromUnit: string,
  toUnit: string,
) {
  if (!Number.isFinite(quantity)) {
    return null;
  }

  const normalisedFromUnit = normaliseUnit(fromUnit);
  const normalisedToUnit = normaliseUnit(toUnit);

  if (!normalisedFromUnit || !normalisedToUnit) {
    return null;
  }

  if (normalisedFromUnit === normalisedToUnit) {
    return quantity;
  }

  if (!canConvertUnit(normalisedFromUnit, normalisedToUnit)) {
    return null;
  }

  if (normalisedFromUnit === "kg" && normalisedToUnit === "g") {
    return quantity * 1000;
  }

  if (normalisedFromUnit === "g" && normalisedToUnit === "kg") {
    return quantity / 1000;
  }

  if (normalisedFromUnit === "l" && normalisedToUnit === "ml") {
    return quantity * 1000;
  }

  if (normalisedFromUnit === "ml" && normalisedToUnit === "l") {
    return quantity / 1000;
  }

  return null;
}

export function describeUnitMismatch(
  formulaUnit: string | null | undefined,
  priceUnit: string | null | undefined,
  sourceLabel = "current price",
) {
  const formulaUnitLabel = formulaUnit || "unknown unit";
  const priceUnitLabel = priceUnit || "unknown unit";

  return `Unit conversion needed: formula uses ${formulaUnitLabel}, ${sourceLabel} uses ${priceUnitLabel}. Add a purchase-unit conversion before this can be costed.`;
}
