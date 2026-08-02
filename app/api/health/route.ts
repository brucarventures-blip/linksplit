const HEALTH_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

export function HEAD() {
  return new Response(null, {
    status: 204,
    headers: HEALTH_HEADERS,
  });
}

export function GET() {
  return Response.json(
    { status: "ok", service: "linksplit" },
    { headers: HEALTH_HEADERS },
  );
}
