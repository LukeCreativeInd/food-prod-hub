"use client";

import { useMemo, useState } from "react";

import type { LogisticsFormOptions } from "@/lib/logistics-data";

const fieldClassName =
  "mt-1 w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
const labelClassName = "text-xs font-semibold uppercase text-slate-500";

export function CarrierServiceSelect({
  options,
  carrierName,
  serviceName,
  carrierLabel,
  serviceLabel,
  carrierEmptyLabel,
  serviceEmptyLabel,
  defaultCarrierId = "",
  defaultServiceId = "",
}: {
  options: LogisticsFormOptions;
  carrierName: string;
  serviceName: string;
  carrierLabel: string;
  serviceLabel: string;
  carrierEmptyLabel: string;
  serviceEmptyLabel: string;
  defaultCarrierId?: string;
  defaultServiceId?: string;
}) {
  const initialCarrierId = options.carriers.some(
    (carrier) => carrier.id === defaultCarrierId,
  )
    ? defaultCarrierId
    : "";
  const initialServiceId = options.services.some(
    (service) =>
      service.id === defaultServiceId && service.carrierId === initialCarrierId,
  )
    ? defaultServiceId
    : "";
  const [carrierId, setCarrierId] = useState(initialCarrierId);
  const [serviceId, setServiceId] = useState(initialServiceId);
  const services = useMemo(
    () => options.services.filter((service) => service.carrierId === carrierId),
    [carrierId, options.services],
  );

  return (
    <>
      <label className="block min-w-0">
        <span className={labelClassName}>{carrierLabel}</span>
        <select
          className={fieldClassName}
          name={carrierName}
          onChange={(event) => {
            setCarrierId(event.target.value);
            setServiceId("");
          }}
          value={carrierId}
        >
          <option value="">{carrierEmptyLabel}</option>
          {options.carriers.map((carrier) => (
            <option key={carrier.id} value={carrier.id}>{carrier.name} ({carrier.code})</option>
          ))}
        </select>
      </label>
      <label className="block min-w-0">
        <span className={labelClassName}>{serviceLabel}</span>
        <select
          className={fieldClassName}
          disabled={!carrierId}
          name={serviceName}
          onChange={(event) => setServiceId(event.target.value)}
          value={services.some((service) => service.id === serviceId) ? serviceId : ""}
        >
          <option value="">{serviceEmptyLabel}</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>{service.name} ({service.code})</option>
          ))}
        </select>
        <span className="mt-1 block text-xs leading-5 text-slate-500">Only active services for the selected carrier are available.</span>
      </label>
    </>
  );
}
