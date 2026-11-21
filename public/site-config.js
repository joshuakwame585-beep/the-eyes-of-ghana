fetch("/site-config.json").then(r => r.json()).then(config => {
  const price = document.querySelector("#display-price");
  if (price) price.innerHTML = `GH₵${Number(config.priceGHS).toFixed(2).replace(/(\.\d{2})$/, '<span>$1</span>')}`;
  const contact = document.querySelector("#footer-contact");
  if (contact) {
    contact.href = `mailto:${config.contactEmail}`;
    contact.textContent = config.contactEmail;
  }
}).catch(() => {});
