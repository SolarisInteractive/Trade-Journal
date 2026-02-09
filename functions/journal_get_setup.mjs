import { json, getStore } from "./_common.mjs";

export default async (event) => {
  try {
    const setup = String(event.queryStringParameters?.setup || "").trim() || "Default";
    const store = getStore("tradejournal");
    const key = `setup/${setup}.json`;
    const data = await store.get(key, { type: "json" });
    return json(200, { setup, data: data || null });
  } catch (e) {
    return json(500, { error: String(e?.message || e) });
  }
};
