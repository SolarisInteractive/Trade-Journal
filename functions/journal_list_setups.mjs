import { json, getIndex, getStore } from "./_common.mjs";

export default async (event) => {
  try {
    const store = getStore("tradejournal");
    const setups = await getIndex(store);
    return json(200, { setups });
  } catch (e) {
    return json(500, { error: String(e?.message || e) });
  }
};
