# The Eyes of Ghana — JK Media storefront

## Central settings
Edit only `site-config.json` to change the public store details:
- `priceGHS`: product price in Ghana cedis
- `currency`: currently `GHS`
- `contactEmail` and `deliveryEmail`: publisher/support email
- `contactPhone`: optional publisher phone (left blank until confirmed)
- `bookTitle` and `brand`: displayed product/brand details

The website asks buyers for their full name, email, Ghana mobile number and Mobile Money network (MTN, Telecel or AT). The checkout function sends the buyer to Paystack's hosted Mobile Money checkout. Buyer details are attached as transaction metadata.

## Netlify deployment
- Publish directory: `public` (the private PDF and function source remain outside the public folder)
- Functions directory: `netlify/functions`
- Add `PAYSTACK_SECRET_KEY` in Netlify environment variables (start with a Paystack TEST secret key).
- Never put the secret key in this repository, `site-config.json`, or browser JavaScript.
- Redeploy after setting or changing environment variables.

## Important: not ready for live sales yet
The paid PDF is stored under `netlify/functions/private/` and is NOT in the public `public/` folder. Netlify bundles it only with the download function using `included_files`. After Paystack redirects the buyer to `success.html`, the site verifies the transaction server-side (success status, exact GHS amount, currency and product metadata), creates a 15-minute signed download token, and displays a download button. The download function validates the token and verifies the Paystack transaction again before returning the PDF as an attachment. No ebook email delivery is used.

The download URL is temporary, but a customer can still share it during its 15-minute validity window. A purchaser can revisit the Paystack success page to obtain a fresh link while the payment reference remains valid. This version does not implement a webhook or a persistent order database; complete test-mode end-to-end checks before switching to live keys.

Use Paystack test mode and complete end-to-end tests before switching to live keys. The hosted Paystack page controls the final Mobile Money authorization flow; the form collects the buyer's phone and network for the order record but does not itself charge the wallet.

## Main files
- `index.html`, `style.css`, `script.js`: storefront and checkout form
- `site-config.json`: central store configuration
- `site-config.js`: reads the central configuration for the public page
- `netlify/functions/initialize-payment.js`: validates buyer details and initializes Paystack
- `netlify/functions/verify-payment.js`: verifies status, currency and amount
- `success.html`: transaction status page
- `assets/book-cover.jpg`: book cover image
