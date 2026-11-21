const config = require("../../site-config.json");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: { Allow: "GET" }, body: "Method Not Allowed" };
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const token = event.queryStringParameters?.token;
  if (!secret || !token || token.length > 2000) {
    return { statusCode: 403, body: "This download link is invalid or expired. Return to your payment confirmation page." };
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 2) throw new Error("Invalid token");
    const [payload, suppliedSignature] = parts;
    const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest();
    const actualSignature = Buffer.from(suppliedSignature, "base64url");
    if (actualSignature.length !== expectedSignature.length ||
        !crypto.timingSafeEqual(actualSignature, expectedSignature)) {
      throw new Error("Invalid signature");
    }

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.reference || !Number.isFinite(data.exp) || Date.now() > data.exp) {
      throw new Error("Expired token");
    }

    // Re-check the payment at download time; a signed URL alone is not proof of payment.
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`, {
      headers: { Authorization: `Bearer ${secret}` }
    });
    const result = await response.json();
    const paid = response.ok && result.status && result.data?.status === "success"
      && result.data?.reference === data.reference
      && result.data?.currency === config.currency
      && result.data?.amount === Number(config.priceGHS) * 100
      && result.data?.metadata?.product === config.bookTitle;
    if (!paid) throw new Error("Payment not verified");

    const pdfPath = path.join(__dirname, "private", "the-eyes-of-ghana.pdf");
    const pdf = fs.readFileSync(pdfPath);
    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="The-Eyes-of-Ghana.pdf"',
        "Content-Length": String(pdf.length),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff"
      },
      body: pdf.toString("base64")
    };
  } catch {
    return { statusCode: 403, headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
      body: "This download link is invalid, expired, or the payment could not be verified. Return to your payment confirmation page or contact the publisher." };
  }
};
