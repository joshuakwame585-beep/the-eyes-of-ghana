const form = document.querySelector("#checkout-form");
const message = document.querySelector("#checkout-message");
document.querySelector("#year").textContent = new Date().getFullYear();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  const email = document.querySelector("#email").value.trim();
  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "Connecting to secure checkout…";
  try {
    const response = await fetch("/.netlify/functions/initialize-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok || !data.authorization_url) {
      throw new Error(data.error || "Checkout could not be started. Please try again.");
    }
    window.location.assign(data.authorization_url);
  } catch (error) {
    message.textContent = error.message;
    button.disabled = false;
    button.innerHTML = 'Continue to secure checkout <span>→</span>';
  }
});
