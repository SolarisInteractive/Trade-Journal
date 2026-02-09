import { getStore } from "@netlify/blobs";

export const handler = async (event) => {
  try {
    const key = String(event.queryStringParameters?.key || "");
    if (!key) return { statusCode: 400, body: "Missing key" };

    const store = getStore("tradejournal");
    const meta = await store.getMetadata(key);
    const contentType = meta?.metadata?.contentType || "application/octet-stream";
    const buf = await store.get(key, { type: "arrayBuffer" });
    if (!buf) return { statusCode: 404, body: "Not found" };

    return {
      statusCode: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=31536000, immutable",
      },
      body: Buffer.from(buf).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (e) {
    return { statusCode: 500, body: String(e?.message || e) };
  }
};
