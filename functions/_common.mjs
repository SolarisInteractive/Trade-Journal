import { getStore } from "@netlify/blobs";

// Modern Netlify Functions (Request/Response) helpers

export function json(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

export function text(body, status = 200, headers = {}) {
  return new Response(String(body ?? ""), {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", ...headers },
  });
}

export function okNoContent() {
  return new Response(null, { status: 204 });
}

export function requireWriteKey(req) {
  const expected = process.env.JOURNAL_WRITE_KEY || "";
  if (!expected) return null; // if env not set, allow writes
  const got = req.headers.get("x-journal-key") || "";
  if (got !== expected) return json({ error: "Unauthorized" }, 401);
  return null;
}

export async function getIndex(store) {
  const raw = await store.get("setup_index", { type: "json" });
  return Array.isArray(raw) ? raw : [];
}

export async function saveIndex(store, arr) {
  await store.set("setup_index", arr);
}

export { getStore };
