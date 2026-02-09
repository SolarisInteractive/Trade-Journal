import { json, getIndex, getStore, okNoContent } from "./_common.mjs";

export default async function (req) {
  if (req.method === "OPTIONS") return okNoContent();
  if (req.method !== "GET") return json({ error: "Method Not Allowed" }, 405);

  try {
    const store = getStore("tradejournal");
    const setups = await getIndex(store);
    return json({ setups }, 200);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
}
