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
- Publish directory: `.`
- Functions directory: `netlify/functions`
- Add `PAYSTACK_SECRET_KEY` in Netlify environment variables (start with a Paystack TEST secret key).
- Never put the secret key in this repository, `site-config.json`, or browser JavaScript.
- Redeploy after setting or changing environment variables.

## Important: not ready for live sales yet
This ZIP does not include the paid PDF or an automatic email/secure-download service. The success page verifies the Paystack transaction but explicitly tells the buyer to contact the publisher. Before advertising automatic delivery or accepting live sales, connect private PDF storage, expiring download links, an email delivery provider, a Paystack webhook with signature verification, and durable order records/idempotency. Keep the paid PDF outside the public website directory.

Use Paystack test mode and complete end-to-end tests before switching to live keys. The hosted Paystack page controls the final Mobile Money authorization flow; the form collects the buyer's phone and network for the order record but does not itself charge the wallet.

## Main files
- `index.html`, `style.css`, `script.js`: storefront and checkout form
- `site-config.json`: central store configuration
- `site-config.js`: reads the central configuration for the public page
- `netlify/functions/initialize-payment.js`: validates buyer details and initializes Paystack
- `netlify/functions/verify-payment.js`: verifies status, currency and amount
- `success.html`: transaction status page
- `assets/book-cover.jpg`: book cover image
