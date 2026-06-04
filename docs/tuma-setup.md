# Tuma M-Pesa Payment Setup

Checkout uses [Tuma](https://api.tuma.co.ke) for M-Pesa STK push. Payments settle to your business bank account configured in Tuma.

## Environment variables

```env
TUMA_API_EMAIL="your-business@example.com"
TUMA_API_KEY="your-tuma-api-key"
TUMA_API_BASE_URL="https://api.tuma.co.ke"
APP_URL="https://your-domain.com"
# Local dev only — public HTTPS tunnel (ngrok, cloudflared, etc.)
TUMA_CALLBACK_PUBLIC_URL="https://your-subdomain.ngrok-free.app"
```

Tuma POSTs payment results to:

`{PUBLIC_URL}/api/payment/tuma/callback?orderId=<order-id>`

Use `TUMA_CALLBACK_PUBLIC_URL` when `APP_URL` is `localhost` — Tuma cannot reach your machine otherwise.

## Checkout flow

1. Customer enters a Kenyan M-Pesa phone number at shipping (e.g. `0712345678`).
2. Customer clicks **Pay with M-Pesa** — the app creates the order and calls Tuma `POST /payment/stk-push`.
3. Customer is sent to `/checkout/payment` and sees instructions to enter their M-Pesa PIN.
4. Tuma sends a webhook to the callback URL when payment completes or fails (`result_code` `0` = success).
5. The payment page polls until the order is confirmed, then redirects to the thank-you page.

## Testing

- Use your Tuma business credentials from the merchant dashboard.
- For local testing: run `ngrok http 3000`, set `TUMA_CALLBACK_PUBLIC_URL` to the ngrok HTTPS URL, restart the dev server.
- Watch server logs for `[tuma/callback]` in development when a payment completes.

## API reference

See Tuma API documentation for auth (`POST /auth/token`), STK push, and callback payload formats.
