-- CreateTable
CREATE TABLE "Subscription" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "channelId" TEXT NOT NULL UNIQUE,
  "channelName" TEXT NOT NULL,
  "thumbnailUrl" TEXT NOT NULL,
  "subscribedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" INTEGER NOT NULL,

  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_channelId_key" ON "Subscription"("channelId");
