const config = require("../../site-config.json");
const crypto = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: { Allow: "GET" }, body: "Method Not Allowed" };
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const reference = event.queryStringParameters?.reference;
  if (!secret || !reference || reference.length > 100) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: false, error: "Missing payment reference or server configuration." }) };
  }
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` }
    });
    const result = await response.json();
    const paid = response.ok && result.status && result.data?.status === "success"
      && result.data?.currency === config.currency
      && result.data?.amount === Number(config.priceGHS) * 100
      && result.data?.metadata?.product === config.bookTitle;

    if (!paid) {
      return { statusCode: 402, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({ verified: false, message: "Payment could not be verified for this ebook. If you were charged, please contact the publisher." }) };
    }

    // Short-lived signed download token. The download function verifies Paystack again.
    const payload = Buffer.from(JSON.stringify({
      reference: result.data.reference,
      exp: Date.now() + 15 * 60 * 1000
    })).toString("base64url");
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    const token = `${payload}.${signature}`;

    return { statusCode: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ verified: true, message: "Payment confirmed! Your ebook is ready.", download_url: `/.netlify/functions/download-ebook?token=${encodeURIComponent(token)}` }) };
  } catch {
    return { statusCode: 502, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ verified: false, error: "Unable to verify payment right now. Please refresh this page in a moment." }) };
  }
};
