import { json, requireWriteKey, getStore } from "./_common.mjs";
import crypto from "node:crypto";

function extFromName(name) {
  const m = /\.([a-z0-9]{1,8})$/i.exec(name || "");
  return m ? m[1].toLowerCase() : "bin";
}

export const handler = async (event) => {
  const authErr = requireWriteKey(event);
  if (authErr) return authErr;

  try {
    const body = JSON.parse(event.body || "{}");
    const setup = String(body.setup || "Default").trim() || "Default";
    const kind = String(body.kind || "trade").trim() || "trade";
    const name = String(body.name || "upload").trim() || "upload";
    const mime = String(body.mime || "application/octet-stream");
    const dataB64 = String(body.dataB64 || "");

    if (!dataB64) return json(400, { error: "Missing dataB64" });

    const buf = Buffer.from(dataB64, "base64");
    const ext = extFromName(name);
    const id = crypto.randomUUID();
    const key = `media/${setup}/${kind}/${id}.${ext}`;

    const store = getStore("tradejournal");
    await store.set(key, buf, { metadata: { contentType: mime, originalName: name, setup, kind } });

    const url = `/.netlify/functions/journal_media?key=${encodeURIComponent(key)}`;
    return json(200, { ok: true, key, url, storedName: `${id}.${ext}` });
  } catch (e) {
    return json(500, { error: String(e?.message || e) });
  }
};
