import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductsFinishedProductDetailRedirectPage({
  params,
}: PageProps) {
  const { id } = await params;

  redirect(`/finished-products/${id}`);
}
