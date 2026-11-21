const config = require("../../site-config.json");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { Allow: "POST" }, body: "Method Not Allowed" };
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return { statusCode: 503, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Paystack has not been configured yet. Please contact the publisher." }) };
  }

  try {
    const { name, email, phone, network } = JSON.parse(event.body || "{}");
    const cleanPhone = String(phone || "").replace(/[\\s()-]/g, "");
    const ghPhone = /^(?:0\\d{9}|\\+233\\d{9})$/.test(cleanPhone);
    if (!name || name.length < 2) {
      return { statusCode: 400, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Enter your full name." }) };
    }
    if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      return { statusCode: 400, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Enter a valid email address." }) };
    }
    if (!ghPhone || !["MTN", "Telecel", "AT"].includes(network)) {
      return { statusCode: 400, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Enter a valid Ghana mobile number and choose your Mobile Money network." }) };
    }

    const reference = `eog_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amount: Number(config.priceGHS) * 100,
        currency: config.currency,
        channels: ["mobile_money"],
        reference,
        callback_url: `${process.env.URL || "http://localhost:8888"}/success.html`,
        metadata: {
          product: config.bookTitle,
          customer_name: name,
          delivery_email: email,
          customer_phone: cleanPhone,
          mobile_money_network: network
        }
      })
    });
    const result = await response.json();
    if (!response.ok || !result.status) {
      return { statusCode: 502, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: result.message || "Paystack could not initialize payment." }) };
    }
    return { statusCode: 200, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorization_url: result.data.authorization_url, reference: result.data.reference }) };
  } catch {
    return { statusCode: 400, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid checkout request." }) };
  }
};
