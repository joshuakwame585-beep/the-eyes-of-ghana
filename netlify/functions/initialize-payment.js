exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { Allow: "POST" }, body: "Method Not Allowed" };
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return { statusCode: 503, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Paystack test key has not been configured yet." }) };
  }
  try {
    const { email } = JSON.parse(event.body || "{}");
    if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      return { statusCode: 400, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Enter a valid email address." }) };
    }
    const reference = `eog_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amount: 2000,
        currency: "GHS",
        channels: ["card", "mobile_money"],
        reference,
        callback_url: `${process.env.URL || "http://localhost:8888"}/success.html`,
        metadata: { product: "The Eyes of Ghana — Digital Edition", delivery_email: email }
      })
    });
    const result = await response.json();
    if (!response.ok || !result.status) {
      return { statusCode: 502, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: result.message || "Paystack could not initialize payment." }) };
    }
    return { statusCode: 200, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorization_url: result.data.authorization_url, reference: result.data.reference }) };
  } catch (error) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid checkout request." }) };
  }
};
