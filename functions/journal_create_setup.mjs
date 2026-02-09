import { json, requireWriteKey, getIndex, saveIndex, getStore, okNoContent } from "./_common.mjs";

export default async function (req) {
  if (req.method === "OPTIONS") return okNoContent();
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const authErr = requireWriteKey(req);
  if (authErr) return authErr;

  try {
    const body = await req.json().catch(() => ({}));
    const setup = String(body.setup || "").trim();
    if (!setup) return json({ error: "Missing setup" }, 400);

    const store = getStore("tradejournal");
    const setups = await getIndex(store);

    if (!setups.includes(setup)) {
      setups.push(setup);
      setups.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
      await saveIndex(store, setups);

      // initialize empty data if not present
      const key = `setup/${setup}.json`;
      const existing = await store.get(key, { type: "json" });
      if (!existing) {
        await store.set(key, {
          version: 1,
          setup,
          tags: [],
          notes: {},
          strategyNotesHtml: "",
          sessions: {},
          examples: [],
          videos: [],
          tradesTaken: {},
        });
      }
    }

    return json({ ok: true, setups }, 200);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
}
