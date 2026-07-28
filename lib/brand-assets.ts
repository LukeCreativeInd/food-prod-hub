export const brandAssetMaxFileBytes = 5 * 1024 * 1024;

export const brandAssetAcceptedMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type BrandAssetAcceptedMimeType =
  (typeof brandAssetAcceptedMimeTypes)[number];

const mimeTypeExtensions: Record<BrandAssetAcceptedMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function isAcceptedBrandAssetMimeType(
  value: string,
): value is BrandAssetAcceptedMimeType {
  return brandAssetAcceptedMimeTypes.includes(
    value as BrandAssetAcceptedMimeType,
  );
}

export function safeBrandAssetFilename(filename: string, mimeType: string) {
  const baseName = filename
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  const safeBaseName = baseName || "brand-asset";
  const safeExtension = isAcceptedBrandAssetMimeType(mimeType)
    ? mimeTypeExtensions[mimeType]
    : "png";

  return `${safeBaseName}.${safeExtension}`;
}

export function buildTenantLogoStoragePath(
  organisationId: string,
  filename: string,
  mimeType: string,
) {
  return `${organisationId}/logo/full-${Date.now()}-${safeBrandAssetFilename(
    filename,
    mimeType,
  )}`;
}

export function buildTenantIconStoragePath(
  organisationId: string,
  filename: string,
  mimeType: string,
) {
  return `${organisationId}/logo/icon-${Date.now()}-${safeBrandAssetFilename(
    filename,
    mimeType,
  )}`;
}
