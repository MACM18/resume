const LOCAL_ORIGIN = "https://portfolio.local";

/** Keep sign-in return paths on the authenticated admin surface. */
export function safeAdminReturnTo(candidate: string | null | undefined): string {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) return "/admin";
  try {
    const target = new URL(candidate, LOCAL_ORIGIN);
    const isAdminPath = target.pathname === "/admin" || target.pathname.startsWith("/admin/");
    return target.origin === LOCAL_ORIGIN && isAdminPath ? target.pathname + target.search + target.hash : "/admin";
  } catch {
    return "/admin";
  }
}
