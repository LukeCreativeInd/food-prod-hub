import { redirect } from "next/navigation";

import { requireAppAccess } from "@/lib/auth";

export default async function HomePage() {
  await requireAppAccess();
  redirect("/dashboard");
}
