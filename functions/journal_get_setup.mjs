import { json, getStore, okNoContent } from "./_common.mjs";

export default async function (req) {
  if (req.method === "OPTIONS") return okNoContent();
  if (req.method !== "GET") return json({ error: "Method Not Allowed" }, 405);

  try {
    const url = new URL(req.url);
    const setup = String(url.searchParams.get("setup") || "").trim() || "Default";
    const store = getStore("tradejournal");
    const key = `setup/${setup}.json`;
    const data = await store.get(key, { type: "json" });
    return json({ setup, data: data || null }, 200);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
}