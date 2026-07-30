"use server";

import { redirect } from "next/navigation";

import {
  archiveCostingSnapshot,
  createCostingSnapshot,
} from "@/lib/costing-snapshot-data";
import {
  isCostingSnapshotType,
  type CostingSnapshotType,
} from "@/lib/costing-snapshot-types";

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safeReturnPath(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/costings";
  }

  return path;
}

export async function createCostingSnapshotAction(formData: FormData) {
  const internalItemId = getRequiredString(formData, "internal_item_id");
  const snapshotType = getRequiredString(formData, "snapshot_type");
  const returnPath = safeReturnPath(getRequiredString(formData, "return_path"));

  if (!internalItemId || !isCostingSnapshotType(snapshotType)) {
    redirect(`${returnPath}?snapshot=invalid`);
  }

  let snapshotId: string;

  try {
    snapshotId = await createCostingSnapshot(
      internalItemId,
      snapshotType as CostingSnapshotType,
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Costing snapshot create failed", error);
    }

    redirect(`${returnPath}?snapshot=error`);
  }

  redirect(`/costing-snapshots/${snapshotId}`);
}

export async function archiveCostingSnapshotAction(formData: FormData) {
  const snapshotId = getRequiredString(formData, "snapshot_id");

  if (!snapshotId) {
    redirect("/costings?snapshot=invalid");
  }

  try {
    await archiveCostingSnapshot(snapshotId);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Costing snapshot archive failed", error);
    }

    redirect(`/costing-snapshots/${snapshotId}?snapshot=archive_error`);
  }

  redirect(`/costing-snapshots/${snapshotId}?snapshot=archived`);
}
