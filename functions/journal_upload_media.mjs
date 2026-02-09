import { json, requireWriteKey, getStore, okNoContent } from "./_common.mjs";
import crypto from "node:crypto";

function extFromName(name) {
  const m = /\.([a-z0-9]{1,8})$/i.exec(name || "");
  return m ? m[1].toLowerCase() : "bin";
}

export default async function (req) {
  if (req.method === "OPTIONS") return okNoContent();
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const authErr = requireWriteKey(req);
  if (authErr) return authErr;

  try {
    const body = await req.json().catch(() => ({}));
    const setup = String(body.setup || "Default").trim() || "Default";
    const kind = String(body.kind || "trade").trim() || "trade";
    const name = String(body.name || "upload").trim() || "upload";
    const mime = String(body.mime || "application/octet-stream");
    const dataB64 = String(body.dataB64 || "");

    if (!dataB64) return json({ error: "Missing dataB64" }, 400);

    const buf = Buffer.from(dataB64, "base64");
    const ext = extFromName(name);
    const id = crypto.randomUUID();
    const key = `media/${setup}/${kind}/${id}.${ext}`;

    const store = getStore("tradejournal");
    await store.set(key, buf, {
      metadata: { contentType: mime, originalName: name, setup, kind },
    });

    const url = `/.netlify/functions/journal_media?key=${encodeURIComponent(key)}`;
    return json({ ok: true, key, url, storedName: `${id}.${ext}` }, 200);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
}
