type DevTimingContext = Record<
  string,
  boolean | number | string | null | undefined
>;

export function logDevRouteTiming(
  label: string,
  startedAt: number,
  context: DevTimingContext = {},
) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.info("[route-timing]", {
    label,
    durationMs: Date.now() - startedAt,
    ...context,
  });
}
