// Odkaz pro klienta: /project/<id> zobrazí Project Tracker jen pro čtení.
export async function onRequestGet({ request, env }) {
  const res = await env.ASSETS.fetch(new URL('/tracker/', request.url));
  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Robots-Tag': 'noindex' },
  });
}
