# Payments (Paystack)

CareerForge AI takes payments with [Paystack](https://paystack.com). Pro is
bought one period at a time (a month or a year): there are no automatic
charges. Users get reminders 3 days and 1 day before their plan ends, and
renewing early adds the new period on top of the time they have left.

## 1. Create a Paystack account

1. Sign up at https://dashboard.paystack.com/#/signup (choose your business country).
2. You can test straight away: the dashboard starts in **Test mode**.
   Real payments need the business to be activated (documents, bank account).

## 2. Add your test key

1. Paystack dashboard → **Settings → API Keys & Webhooks**.
2. Copy the **Test Secret Key** (starts with `sk_test_`).
3. In your `.env` file (never in the code, never in a chat):

   ```
   PAYSTACK_SECRET_KEY="sk_test_..."
   PAYMENT_CURRENCIES="NGN"
   ```

4. Restart the app (`npm start`, or `npm run dev`).

Without a key, `npm run dev` upgrades directly without payment (for testing
the Pro features), and a live site refuses upgrades.

## 3. Test a payment

1. Billing page → **Upgrade to Pro**. You are sent to the Paystack checkout.
2. Pay with a Paystack test card, e.g. `4084 0840 8408 4081`, any future
   expiry date, CVV `408`, PIN `0000`, OTP `123456`
   (more at https://paystack.com/docs/payments/test-payments).
3. You come back to the Billing page: "Payment received", the plan shows Pro
   with its end date, and the payment appears in the history.

## 4. Webhook (after deploying)

The webhook gives the plan even if the customer closes the page before coming
back. It needs a public address, so set it once the site is online:

Paystack dashboard → Settings → API Keys & Webhooks → **Test Webhook URL**
(and later **Live Webhook URL**): `https://<your-site>/api/billing/webhook`

Paystack signs every webhook with your secret key; the app checks the
signature and then asks Paystack for the payment's real status.

## Currencies and prices

| Currency | Who can accept it | Default Pro price |
| --- | --- | --- |
| NGN | Nigerian businesses | ₦7,900 / month, ₦79,000 / year |
| USD | Nigerian or Kenyan businesses, after Paystack approves international payments | $7.99 / month, $79.99 / year |
| XOF | Businesses registered in Côte d'Ivoire | 4,900 / month, 49,000 / year FCFA |

- `PAYMENT_CURRENCIES` lists the currencies to offer. Only list the ones your
  Paystack account can accept, or checkout will fail for that currency.
- Visitors see their country's currency automatically (Nigeria → NGN, CFA
  franc countries → XOF, others → USD) when it is offered, and can switch on
  the Billing page.
- Change prices in Supabase → Table editor → **PlanPrice**. Amounts are ×100:
  ₦7,900 is `790000`, $7.99 is `799`, 4,900 FCFA is `490000`.

## Going live

1. Activate your business on Paystack.
2. Replace the test key with the **Live Secret Key** (`sk_live_...`) in the
   hosting provider's environment variables (e.g. Vercel → Settings →
   Environment Variables), not in the code.
3. Set the **Live Webhook URL**.
4. Make one small real payment to check everything.
