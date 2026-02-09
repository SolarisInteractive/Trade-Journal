import { getStore } from "@netlify/blobs";
import { okNoContent, text } from "./_common.mjs";

export default async function (req) {
  if (req.method === "OPTIONS") return okNoContent();
  if (req.method !== "GET") return text("Method Not Allowed", 405);

  try {
    const url = new URL(req.url);
    const key = String(url.searchParams.get("key") || "");
    if (!key) return text("Missing key", 400);

    const store = getStore("tradejournal");
    const meta = await store.getMetadata(key);
    const contentType = meta?.metadata?.contentType || "application/octet-stream";
    const buf = await store.get(key, { type: "arrayBuffer" });
    if (!buf) return text("Not found", 404);

    return new Response(Buffer.from(buf), {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    return text(String(e?.message || e), 500);
  }
}
