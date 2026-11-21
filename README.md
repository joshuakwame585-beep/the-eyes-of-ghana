# The Eyes of Ghana — Netlify storefront starter

Configured choices:
- Product: The Eyes of Ghana — Digital Edition
- Price: GH₵20.00 (Paystack amount: 2000 pesewas)
- Delivery preference: email + secure download (delivery provider/storage still needs wiring)
- Hosting: new Netlify site
- Front cover extracted from the supplied Word manuscript: assets/book-cover.jpg

## Run locally
1. Install Node.js and Netlify CLI.
2. From this folder run `npm install` (there are no external runtime dependencies) and `netlify dev`.
3. Add `PAYSTACK_SECRET_KEY` as a Netlify environment variable using a Paystack TEST secret key first.
4. Open the local Netlify dev URL.

## Deploy
1. Create a new site in Netlify and deploy this folder/repository.
2. In Netlify Site configuration → Environment variables, add `PAYSTACK_SECRET_KEY` (TEST key initially).
3. Redeploy after adding environment variables.
4. Configure the Paystack callback URL through the initialized transaction; the function uses Netlify's `URL`.

## Important — not production-ready yet
- Never put the Paystack secret key in browser JavaScript or commit it to Git.
- The payment initializer and server-side verifier are included. The verifier checks successful status, GHS currency and the fixed 2000-pesewa amount.
- Secure PDF storage, signed/expiring download links, email delivery, webhook signature validation, order records/idempotency and customer support details still need to be connected before live sales.
- Keep the actual book PDF outside the public site folder. Do not upload it into `assets/` or any public folder.
- The uploaded manuscript is labelled Part One and contains ten chapters. Confirm the final customer edition and proofread it before accepting live orders.
- Use Paystack test mode until the merchant account is verified and the full purchase-to-delivery flow has been tested.

## Files
- `index.html`, `style.css`, `script.js`: responsive storefront
- `success.html`: payment status page
- `netlify/functions/initialize-payment.js`: creates a Paystack checkout session server-side
- `netlify/functions/verify-payment.js`: verifies the transaction server-side
- `assets/book-cover.jpg`: cover image extracted from the supplied manuscript
