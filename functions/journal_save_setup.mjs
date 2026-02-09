import { json, requireWriteKey, getIndex, saveIndex, getStore } from "./_common.mjs";

export const handler = async (event) => {
  const authErr = requireWriteKey(event);
  if (authErr) return authErr;

  try {
    const body = JSON.parse(event.body || "{}");
    const setup = String(body.setup || "").trim() || "Default";
    const data = body.data;
    if (!data || typeof data !== "object") return json(400, { error: "Missing data" });

    const store = getStore("tradejournal");

    // ensure setup in index
    const setups = await getIndex(store);
    if (!setups.includes(setup)) {
      setups.push(setup);
      setups.sort((a,b)=>a.localeCompare(b, undefined, {numeric:true, sensitivity:"base"}));
      await saveIndex(store, setups);
    }

    const key = `setup/${setup}.json`;
    data.setup = setup;
    data.updatedAt = new Date().toISOString();
    await store.set(key, data);

    return json(200, { ok: true });
  } catch (e) {
    return json(500, { error: String(e?.message || e) });
  }
};
