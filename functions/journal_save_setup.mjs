import { json, requireWriteKey, getIndex, saveIndex, getStore, okNoContent } from "./_common.mjs";

export default async function (req) {
  if (req.method === "OPTIONS") return okNoContent();
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const authErr = requireWriteKey(req);
  if (authErr) return authErr;

  try {
    const body = await req.json().catch(() => ({}));
    const setup = String(body.setup || "").trim() || "Default";
    const data = body.data;
    if (!data || typeof data !== "object") return json({ error: "Missing data" }, 400);

    const store = getStore("tradejournal");

    // ensure setup in index
    const setups = await getIndex(store);
    if (!setups.includes(setup)) {
      setups.push(setup);
      setups.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
      await saveIndex(store, setups);
    }

    const key = `setup/${setup}.json`;
    data.setup = setup;
    data.updatedAt = new Date().toISOString();
    await store.set(key, data);

    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
}
