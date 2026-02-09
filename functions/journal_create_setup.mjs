import { json, requireWriteKey, getIndex, saveIndex, getStore } from "./_common.mjs";

export const handler = async (event) => {
  const authErr = requireWriteKey(event);
  if (authErr) return authErr;

  try {
    const body = JSON.parse(event.body || "{}");
    const setup = String(body.setup || "").trim();
    if (!setup) return json(400, { error: "Missing setup" });

    const store = getStore("tradejournal");
    const setups = await getIndex(store);
    if (!setups.includes(setup)) {
      setups.push(setup);
      setups.sort((a,b)=>a.localeCompare(b, undefined, {numeric:true, sensitivity:"base"}));
      await saveIndex(store, setups);
      // initialize empty data if not present
      const key = `setup/${setup}.json`;
      const existing = await store.get(key, { type: "json" });
      if (!existing) {
        await store.set(key, { version: 1, setup, tags: [], notes: {}, strategyNotesHtml:"", sessions:{}, examples:[], videos:[], tradesTaken:{} });
      }
    }

    return json(200, { ok: true, setups });
  } catch (e) {
    return json(500, { error: String(e?.message || e) });
  }
};
