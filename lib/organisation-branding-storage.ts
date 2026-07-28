export const organisationBrandingBucket = "organisation-branding";

type SignedUrlClient = {
  storage: {
    from: (bucket: string) => {
      createSignedUrl: (
        path: string,
        expiresIn: number,
      ) => Promise<{
        data: { signedUrl: string } | null;
        error: { message: string } | null;
      }>;
    };
  };
};

function isHttpUrl(value: string) {
  return value.startsWith("https://") || value.startsWith("http://");
}

export async function getOrganisationBrandingAssetDisplayUrl(
  supabase: SignedUrlClient,
  assetPathOrUrl: string | null | undefined,
) {
  if (!assetPathOrUrl) {
    return "";
  }

  if (isHttpUrl(assetPathOrUrl)) {
    return assetPathOrUrl;
  }

  const { data, error } = await supabase.storage
    .from(organisationBrandingBucket)
    .createSignedUrl(assetPathOrUrl, 60 * 60);

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Organisation branding asset signed URL failed", {
        assetPath: assetPathOrUrl,
        message: error.message,
      });
    }

    return "";
  }

  return data?.signedUrl ?? "";
}

export const getOrganisationLogoDisplayUrl =
  getOrganisationBrandingAssetDisplayUrl;
