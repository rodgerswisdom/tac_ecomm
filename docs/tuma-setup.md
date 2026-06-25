# Tuma M-Pesa Payment Setup

Checkout uses [Tuma](https://api.tuma.co.ke) for M-Pesa STK push. Payments settle to your business bank account configured in Tuma.

## Environment variables

```env
TUMA_API_EMAIL="your-business@example.com"
TUMA_API_KEY="your-tuma-api-key"
TUMA_API_BASE_URL="https://api.tuma.co.ke"
APP_URL="https://www.tacaccessories.co.ke"
NEXTAUTH_URL="https://www.tacaccessories.co.ke"
# Local dev only — public HTTPS tunnel (ngrok, cloudflared, etc.)
TUMA_CALLBACK_PUBLIC_URL="https://your-subdomain.ngrok-free.app"
```

### Production requirements

- **`APP_URL`** must be the exact public HTTPS domain customers use (no trailing slash). Example: `https://www.tacaccessories.co.ke`.
- **`NEXTAUTH_URL`** should match **`APP_URL`** on Vercel.
- Do **not** use `localhost`, `http://`, or a bare domain if the site is served on `www`.
- Redeploy after changing env vars so STK push uses the updated callback URL.

Tuma POSTs payment results to:

`{APP_URL}/api/payment/tuma/callback?orderId=<order-id>`

Use `TUMA_CALLBACK_PUBLIC_URL` when `APP_URL` is `localhost` — Tuma cannot reach your machine otherwise.

At checkout, the server validates the callback URL before sending STK push. Invalid URLs (localhost without a tunnel, or non-HTTPS in production) are rejected with a 400 error.

## Checkout flow

1. Customer enters a Kenyan M-Pesa phone number at shipping (e.g. `0712345678`).
2. Customer clicks **Pay with M-Pesa** — the app creates the order and calls Tuma `POST /payment/stk-push`.
3. Customer is sent to `/checkout/payment` and sees instructions to enter their M-Pesa PIN.
4. Tuma sends a webhook to the callback URL when payment completes or fails (`result_code` `0` = success).
5. The payment page polls every 1.5s (then 3s after 60s) until the order is confirmed, shows success in place, then redirects to thank-you.

## Verifying callbacks in production

1. Place a test order on the live site.
2. In Vercel logs, confirm `[tuma/stk-push]` shows the correct `callback_url`.
3. Complete M-Pesa payment on your phone.
4. Confirm `[tuma/callback]` appears with `result_code: 0` and `mpesa_receipt_number`.
5. The payment page should flip to “Payment received” within ~2 seconds.

If payment succeeds on the phone but the site stays pending, the callback URL is almost certainly wrong — check `APP_URL` and redeploy.

## Testing locally

- Use your Tuma business credentials from the merchant dashboard.
- Run `ngrok http 3000`, set `TUMA_CALLBACK_PUBLIC_URL` to the ngrok HTTPS URL, restart the dev server.
- Watch server logs for `[tuma/callback]` when a payment completes.

## API reference

See Tuma API documentation for auth (`POST /auth/token`), STK push, and callback payload formats.
