// Cloudflare entry point: wraps the OpenNext worker (built into .open-next/) and serves /ingest/* as a
// first-party proxy to PostHog, so ad blockers that block *.posthog.com don't drop analytics.
// Plain JS so `next build` doesn't type-check it before .open-next/ exists.
import openNext from "./.open-next/worker.js";

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

const INGEST = "/ingest";

async function posthogProxy(request, url) {
  const path = url.pathname.slice(INGEST.length) || "/";
  const host = path.startsWith("/static/") || path.startsWith("/array/") ? "us-assets.i.posthog.com" : "us.i.posthog.com";
  const headers = new Headers(request.headers);
  headers.delete("cookie"); // our site's cookies (Supabase session) must never reach PostHog
  headers.delete("host");
  // PostHog geolocates from X-Forwarded-For; without it every visitor would look like a Cloudflare datacentre.
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) headers.set("x-forwarded-for", ip);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  return fetch(`https://${host}${path}${url.search}`, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: "manual",
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === INGEST || url.pathname.startsWith(INGEST + "/")) {
      try {
        return await posthogProxy(request, url);
      } catch {
        return new Response(null, { status: 502 });
      }
    }
    return openNext.fetch(request, env, ctx);
  },
};
