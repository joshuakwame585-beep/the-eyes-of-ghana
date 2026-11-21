exports.handler = async (event) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const reference = event.queryStringParameters?.reference;
  if (!secret || !reference) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: false, error: "Missing payment reference or server configuration." }) };
  }
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` }
    });
    const result = await response.json();
    const paid = response.ok && result.status && result.data?.status === "success"
      && result.data?.currency === "GHS" && result.data?.amount === 2000;
    return { statusCode: paid ? 200 : 402, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: Boolean(paid), message: paid
        ? "Payment verified. Secure delivery is the next setup step."
        : "Payment could not be verified for this order." }) };
  } catch {
    return { statusCode: 502, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: false, error: "Unable to verify payment right now." }) };
  }
};
