-- CreateEnum
-- Enum types are not natively supported in SQLite, so we use TEXT with check constraints.
-- Prisma handles enum validation at the application level when relationMode = "prisma".

-- CreateTable
CREATE TABLE IF NOT EXISTS "MusicSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bandName" TEXT NOT NULL,
    "realName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "spotifyLink" TEXT,
    "soundcloudLink" TEXT,
    "city" TEXT NOT NULL,
    "genre" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SponsorInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "plan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Donation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "amount" REAL NOT NULL,
    "tier" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "KantoFundEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "quarter" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "phone" TEXT,
    "avatar" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'credentials',
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- CreateTable
CREATE TABLE IF NOT EXISTS "ArtistProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bandName" TEXT NOT NULL,
    "realName" TEXT NOT NULL,
    "genre" TEXT,
    "city" TEXT NOT NULL,
    "bio" TEXT,
    "spotifyLink" TEXT,
    "soundcloudLink" TEXT,
    "socialLinks" TEXT,
    "imageUrl" TEXT,
    "stripeAccountId" TEXT,
    "stripeOnboardingComplete" INTEGER NOT NULL DEFAULT 0,
    "isVerified" INTEGER NOT NULL DEFAULT 0,
    "storeStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "storeRejectedReason" TEXT,
    "totalSales" REAL NOT NULL DEFAULT 0,
    "totalAirplays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "ArtistProfile_userId_idx" ON "ArtistProfile"("userId");
CREATE INDEX IF NOT EXISTS "ArtistProfile_storeStatus_idx" ON "ArtistProfile"("storeStatus");
CREATE UNIQUE INDEX IF NOT EXISTS "ArtistProfile_userId_key" ON "ArtistProfile"("userId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "artistId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "compareAtPrice" REAL,
    "category" TEXT NOT NULL,
    "productType" TEXT NOT NULL DEFAULT 'PHYSICAL',
    "images" TEXT NOT NULL,
    "sizes" TEXT,
    "colors" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "fulfillmentMode" TEXT NOT NULL DEFAULT 'PLATFORM_DELIVERY',
    "shippingFee" REAL NOT NULL DEFAULT 0,
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "isStation" INTEGER NOT NULL DEFAULT 0,
    "isFlagged" INTEGER NOT NULL DEFAULT 0,
    "flagReason" TEXT,
    "downloadUrl" TEXT,
    "fileSize" TEXT,
    "fileFormat" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("artistId") REFERENCES "ArtistProfile"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "Product_artistId_idx" ON "Product"("artistId");
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category");
CREATE INDEX IF NOT EXISTS "Product_isActive_idx" ON "Product"("isActive");
CREATE INDEX IF NOT EXISTS "Product_productType_idx" ON "Product"("productType");
CREATE INDEX IF NOT EXISTS "Product_isStation_idx" ON "Product"("isStation");

-- CreateTable
CREATE TABLE IF NOT EXISTS "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" TEXT NOT NULL,
    "customerId" INTEGER,
    "guestEmail" TEXT,
    "guestName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalAmount" REAL NOT NULL,
    "platformRevenue" REAL NOT NULL DEFAULT 0,
    "artistRevenueTotal" REAL NOT NULL DEFAULT 0,
    "shippingAddress" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "trackingNumber" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("customerId") REFERENCES "User"("id") ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX IF NOT EXISTS "Order_guestEmail_idx" ON "Order"("guestEmail");
CREATE INDEX IF NOT EXISTS "Order_orderNumber_idx" ON "Order"("orderNumber");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");

-- CreateTable
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "productImage" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "fulfillmentMode" TEXT NOT NULL,
    "shippingFee" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isStationMerch" INTEGER NOT NULL DEFAULT 0,
    "isDigital" INTEGER NOT NULL DEFAULT 0,
    "downloadUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON UPDATE NO ACTION,
    FOREIGN KEY ("artistId") REFERENCES "ArtistProfile"("id") ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX IF NOT EXISTS "OrderItem_artistId_idx" ON "OrderItem"("artistId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "Cart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "sessionId" TEXT,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "size" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "Cart_userId_idx" ON "Cart"("userId");
CREATE INDEX IF NOT EXISTS "Cart_sessionId_idx" ON "Cart"("sessionId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY ("customerId") REFERENCES "User"("id") ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");
CREATE INDEX IF NOT EXISTS "Review_customerId_idx" ON "Review"("customerId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" INTEGER NOT NULL DEFAULT 0,
    "link" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateTable
CREATE TABLE IF NOT EXISTS "DigitalPurchase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "fileFormat" TEXT,
    "accessCode" TEXT NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "maxDownloads" INTEGER NOT NULL DEFAULT 10,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX IF NOT EXISTS "DigitalPurchase_accessCode_key" ON "DigitalPurchase"("accessCode");
CREATE UNIQUE INDEX IF NOT EXISTS "DigitalPurchase_userId_productId_orderId_key" ON "DigitalPurchase"("userId", "productId", "orderId");
CREATE INDEX IF NOT EXISTS "DigitalPurchase_userId_idx" ON "DigitalPurchase"("userId");
CREATE INDEX IF NOT EXISTS "DigitalPurchase_accessCode_idx" ON "DigitalPurchase"("accessCode");

-- CreateTable
CREATE TABLE IF NOT EXISTS "Tip" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromUserId" INTEGER,
    "guestEmail" TEXT,
    "guestName" TEXT,
    "artistId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "message" TEXT,
    "paymentIntentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("artistId") REFERENCES "ArtistProfile"("id") ON UPDATE NO ACTION,
    FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "Tip_artistId_idx" ON "Tip"("artistId");
CREATE INDEX IF NOT EXISTS "Tip_fromUserId_idx" ON "Tip"("fromUserId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "SiteSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT 'general',
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "SiteSetting_key_key" ON "SiteSetting"("key");

-- CreateTable
CREATE TABLE IF NOT EXISTS "Badge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "Badge_type_key" ON "Badge"("type");

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserBadge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "badgeId" INTEGER NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");
CREATE INDEX IF NOT EXISTS "UserBadge_userId_idx" ON "UserBadge"("userId");
