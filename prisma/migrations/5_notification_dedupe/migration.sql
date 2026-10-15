-- Automatic notifications (reminders, due dates, usage) carry a key so the
-- same event is only reported once per user
ALTER TABLE "Notification" ADD COLUMN "dedupe_key" TEXT;

CREATE UNIQUE INDEX "Notification_user_id_dedupe_key_key" ON "Notification"("user_id", "dedupe_key");
