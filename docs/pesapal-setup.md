# Pesapal Payment Gateway Setup

This guide explains how to get your Pesapal access token and register an IPN listener for your application.

---

## 1. Prerequisites

- Pesapal account (sandbox or production)
- Your application domain (e.g., `https://your-domain.com`)
- Live or sandbox consumer key and consumer secret

---

## 2. Environment Variables

Add the following variables to your `.env` or `.env.local` file:

```env
PESAPAL_CONSUMER_KEY="your-pesapal-consumer-key"
PESAPAL_CONSUMER_SECRET="your-pesapal-consumer-secret"
PESAPAL_ENVIRONMENT="sandbox" # or "production"
PESAPAL_NOTIFICATION_ID="your-pesapal-ipn-id"
````

> The `PESAPAL_NOTIFICATION_ID` will be obtained after registering your IPN listener (see step 3).

---

## 3. Register IPN Listener

1. Get an **access token** using your consumer key and secret:

   ```bash
   curl -X POST https://pay.pesapal.com/v3/api/Auth/RequestToken \
     -H "Content-Type: application/json" \
     -d '{
       "consumer_key":"<YOUR-CONSUMER-KEY>",
       "consumer_secret":"<YOUR-CONSUMER-SECRET>"
     }'
   ```

   The response will include a token (`access_token`) and expiry time.

2. Register your **IPN listener URL** using the access token:

   ```bash
   curl -X POST "https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN" \
     -H "Authorization: Bearer <ACCESS_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "url":"https://your-domain.com/api/pesapal/notification",
       "ipn_notification_type":"POST"
     }'
   ```

3. The response will return an **IPN ID**.

4. Copy the IPN ID into your `.env.local`:

   ```env
   PESAPAL_NOTIFICATION_ID="your-pesapal-ipn-id"
   ```

---

## 4. Environment Setup

- For **sandbox/testing**, set:

  ```env
  PESAPAL_ENVIRONMENT="sandbox"
  ```

- For **production/live payments**, set:

  ```env
  PESAPAL_ENVIRONMENT="production"
  ```

- Always use credentials corresponding to the chosen environment.

---

## 5. Integration

- Use `PESAPAL_CONSUMER_KEY` and `PESAPAL_CONSUMER_SECRET` in your backend payment integration.
- Use `PESAPAL_NOTIFICATION_ID` to receive payment notifications via your registered IPN endpoint.

---

**Reference:** [Pesapal API Documentation](https://developer.pesapal.com/)
