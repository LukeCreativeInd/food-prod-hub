export type RootRouteMode =
  | "marketing"
  | "central_app"
  | "tenant_app"
  | "platform_admin"
  | "support"
  | "local_dev"
  | "unknown";

export type RootRouteDecision = {
  action: "redirect" | "rewrite";
  href: string;
};

export function getDeterministicRootRoute(
  mode: RootRouteMode,
  options: {
    centralAppDomain?: string;
    isActiveTenant?: boolean;
  } = {},
): RootRouteDecision {
  switch (mode) {
    case "marketing":
      return {
        action: "redirect",
        href: `https://${options.centralAppDomain ?? "app.everybatchmrp.com"}/login`,
      };
    case "central_app":
      return { action: "redirect", href: "/select-workspace" };
    case "tenant_app":
      return {
        action: "redirect",
        href: options.isActiveTenant === false ? "/login" : "/dashboard",
      };
    case "platform_admin":
      return { action: "redirect", href: "/platform" };
    case "support":
      return { action: "rewrite", href: "/support" };
    case "local_dev":
      return { action: "redirect", href: "/dashboard" };
    case "unknown":
    default:
      return { action: "redirect", href: "/login" };
  }
}
