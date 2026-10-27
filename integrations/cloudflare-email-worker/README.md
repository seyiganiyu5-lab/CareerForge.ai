# Job-tracker email forwarding (Cloudflare, free)

Each user gets a personal address like `track-k3m9x2p7q4rt@inbox.YOUR-DOMAIN`.
When they forward job emails to it, Hassify updates their job tracker by itself.

Cost: a domain name (about $10 a year). Cloudflare Email Routing and Workers are free.

## 1. App settings (Vercel → Settings → Environment Variables, and your local `.env`)

```
INBOUND_EMAIL_DOMAIN="inbox.YOUR-DOMAIN"
INBOUND_EMAIL_SECRET="a-long-random-string"
```

Make the secret long and random (e.g. 40+ characters from a password generator).
Redeploy after adding them.

## 2. Cloudflare Email Routing

1. Add your domain to Cloudflare (free plan) if it isn't there yet.
2. Cloudflare dashboard → your domain → **Email** → **Email Routing** → enable it.
   Cloudflare adds the MX/TXT records for you. To keep your main domain's email
   untouched, use a subdomain such as `inbox.YOUR-DOMAIN`.

## 3. The worker

1. **Workers & Pages** → **Create** → **Create Worker** → name it `hassify-inbound` → Deploy.
2. **Edit code**: replace everything with the contents of `worker.js` → **Deploy**.
3. **Settings → Variables and Secrets** → add:
   - `WEBHOOK_URL` = `https://YOUR-SITE/api/inbound-email`
   - `INBOUND_EMAIL_SECRET` = the same secret as in the app (type: Secret)

## 4. Route the emails to the worker

Email Routing → **Routing rules** → **Catch-all address** → Action: **Send to a Worker** →
`hassify-inbound` → Save, and make sure the catch-all is **enabled**.

## 5. Test

In Hassify → Job Tracker → **Paste an email** → **Automatic forwarding** tab,
copy your address and send it a test email such as:

> Subject: Your application to Acme
> Thank you for applying to the Product Designer role at Acme. We have received your application.

Within a few seconds the application appears in the tracker and a notification
shows in the bell.
