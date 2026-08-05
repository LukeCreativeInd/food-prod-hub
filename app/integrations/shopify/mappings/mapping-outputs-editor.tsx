"use client";

import { useMemo, useState } from "react";

import type {
  CommerceMappingInternalItem,
  CommerceMappingKind,
} from "@/lib/commerce-mapping-types";

type OutputValue = {
  key: string;
  internalItemId: string;
  quantity: string;
  outputUom: string;
  outputRole: string;
  search: string;
};

type MappingOutputsEditorProps = {
  mappingKind: CommerceMappingKind;
  items: CommerceMappingInternalItem[];
  initialOutputs: Array<{
    internalItemId: string;
    quantity: number;
    outputUom: string;
    outputRole: string;
  }>;
};

function makeRow(
  key: string,
  output?: MappingOutputsEditorProps["initialOutputs"][number],
): OutputValue {
  return {
    key,
    internalItemId: output?.internalItemId ?? "",
    quantity: output ? String(output.quantity) : "1",
    outputUom: output?.outputUom ?? "",
    outputRole: output?.outputRole ?? "primary",
    search: "",
  };
}

export function MappingOutputsEditor({
  mappingKind,
  items,
  initialOutputs,
}: MappingOutputsEditorProps) {
  const [rows, setRows] = useState<OutputValue[]>(() => {
    if (initialOutputs.length > 0) {
      return initialOutputs.map((output, index) => makeRow(`existing-${index}`, output));
    }
    return mappingKind === "bundle"
      ? [makeRow("initial-0"), makeRow("initial-1")]
      : [makeRow("initial-0")];
  });

  const itemsById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );

  function updateRow(key: string, update: Partial<OutputValue>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...update } : row)),
    );
  }

  function selectItem(key: string, internalItemId: string) {
    const item = itemsById.get(internalItemId);
    updateRow(key, {
      internalItemId,
      outputUom: item?.baseUnit ?? "",
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {rows.map((row, index) => {
          const query = row.search.trim().toLowerCase();
          const filteredItems = query
            ? items.filter(
                (item) =>
                  item.displayName.toLowerCase().includes(query) ||
                  item.itemType.toLowerCase().includes(query) ||
                  item.baseUnit.toLowerCase().includes(query),
              )
            : items;

          return (
            <div
              key={row.key}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">
                  Output {index + 1}
                </p>
                {mappingKind === "bundle" && rows.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setRows((current) => current.filter((item) => item.key !== row.key))
                    }
                    className="text-sm font-semibold text-red-700 hover:text-red-800"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(8rem,0.7fr)_minmax(7rem,0.6fr)_minmax(9rem,0.8fr)]">
                <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                  <span>Internal item</span>
                  <input
                    type="search"
                    value={row.search}
                    onChange={(event) => updateRow(row.key, { search: event.target.value })}
                    placeholder="Filter finished products or components"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
                  />
                  <select
                    name="output_internal_item_id"
                    value={row.internalItemId}
                    onChange={(event) => selectItem(row.key, event.target.value)}
                    required
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
                  >
                    <option value="">Select an active item</option>
                    {filteredItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.displayName} · {item.itemType.replaceAll("_", " ")} · {item.baseUnit} · active
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                  <span>Quantity per source unit</span>
                  <input
                    name="output_quantity_multiplier"
                    type="number"
                    min="0.000001"
                    step="0.000001"
                    value={row.quantity}
                    onChange={(event) => updateRow(row.key, { quantity: event.target.value })}
                    required
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                  <span>Output UOM</span>
                  <input
                    name="output_uom"
                    value={row.outputUom}
                    readOnly
                    required
                    className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-normal text-slate-700"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                  <span>Contribution role</span>
                  <select
                    name="output_role"
                    value={row.outputRole}
                    onChange={(event) => updateRow(row.key, { outputRole: event.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
                  >
                    <option value="primary">Primary</option>
                    <option value="component">Component</option>
                    <option value="pack_component">Pack component</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {mappingKind === "bundle" && rows.length < 100 ? (
        <button
          type="button"
          onClick={() =>
            setRows((current) => [
              ...current,
              makeRow(`added-${current.length}-${crypto.randomUUID()}`),
            ])
          }
          className="rounded-md border border-[color:var(--tenant-primary-border)] bg-white px-3.5 py-2 text-sm font-semibold text-[var(--tenant-primary)] hover:bg-[var(--tenant-primary-soft)]"
        >
          Add output
        </button>
      ) : null}

      <p className="text-xs leading-5 text-slate-500">
        Quantities are stored exactly to six decimal places. Output UOM is pinned to the active item base unit; no conversion or rounding is applied here.
      </p>
    </div>
  );
}
