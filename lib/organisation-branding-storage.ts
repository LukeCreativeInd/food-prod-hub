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

export async function getOrganisationLogoDisplayUrl(
  supabase: SignedUrlClient,
  logoUrl: string | null | undefined,
) {
  if (!logoUrl) {
    return "";
  }

  if (isHttpUrl(logoUrl)) {
    return logoUrl;
  }

  const { data, error } = await supabase.storage
    .from(organisationBrandingBucket)
    .createSignedUrl(logoUrl, 60 * 60);

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Organisation logo signed URL failed", {
        logoPath: logoUrl,
        message: error.message,
      });
    }

    return "";
  }

  return data?.signedUrl ?? "";
}
