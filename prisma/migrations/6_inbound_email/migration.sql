-- Personal address users forward job emails to (job tracker automation)
ALTER TABLE "User" ADD COLUMN "inbound_email_token" TEXT;

CREATE UNIQUE INDEX "User_inbound_email_token_key" ON "User"("inbound_email_token");
