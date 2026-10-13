-- A Flutterwave transaction can only be recorded once, so the webhook and the
-- redirect check can't both apply the same payment.
CREATE UNIQUE INDEX "Payment_flutterwave_transaction_id_key" ON "Payment"("flutterwave_transaction_id");
