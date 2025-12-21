export function buildBackendHeaders(
  request: NextRequest,
  initHeaders: Record<string, string> = {}
) {
  const headers = new Headers(initHeaders);

  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim() ?? request.ip;
  if (clientIp) {
    headers.set("x-forwarded-for", clientIp);
    headers.set("x-real-ip", clientIp);
  }

  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol;
  if (proto) {
    headers.set("x-forwarded-proto", proto);
  }

  return headers;
}