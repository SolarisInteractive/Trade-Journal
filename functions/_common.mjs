import { getStore } from "@netlify/blobs";

function json(statusCode, obj, headers={}) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
    body: JSON.stringify(obj),
  };
}

function requireWriteKey(event) {
  const expected = process.env.JOURNAL_WRITE_KEY || "";
  if (!expected) return null; // no key required if env not set
  const got = event.headers?.["x-journal-key"] || event.headers?.["X-Journal-Key"] || "";
  if (got !== expected) return json(401, { error: "Unauthorized" });
  return null;
}

async function getIndex(store) {
  const raw = await store.get("setup_index", { type: "json" });
  return Array.isArray(raw) ? raw : [];
}

async function saveIndex(store, arr) {
  await store.set("setup_index", arr);
}

export { json, requireWriteKey, getIndex, saveIndex, getStore };
