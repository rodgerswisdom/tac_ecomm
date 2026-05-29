# Tuma M-Pesa Payment Setup

Checkout uses [Tuma](https://api.tuma.co.ke) for M-Pesa STK push. Payments settle to your business bank account configured in Tuma.

## Environment variables

```env
TUMA_API_EMAIL="your-business@example.com"
TUMA_API_KEY="your-tuma-api-key"
TUMA_API_BASE_URL="https://api.tuma.co.ke"
APP_URL="https://your-domain.com"
```

`APP_URL` must be publicly reachable so Tuma can POST payment callbacks to:

`https://your-domain.com/api/payment/tuma/callback?orderId=<order-id>`

## Checkout flow

1. Customer enters a Kenyan M-Pesa phone number at shipping (e.g. `0712345678`).
2. On place order, the app calls Tuma `POST /payment/stk-push`.
3. Customer approves the prompt on their phone.
4. Tuma sends a webhook to the callback URL; the order is confirmed when `result_code` is `0`.

## Testing

- Use your Tuma business credentials from the merchant dashboard.
- Ensure the callback URL is HTTPS in production (Tuma cannot reach `localhost`; use a tunnel such as ngrok for local webhook testing).

## API reference

See Tuma API documentation for auth (`POST /auth/token`), STK push, and callback payload formats.
