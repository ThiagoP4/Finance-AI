-- CreateTable
CREATE TABLE "Category" (
    "idCategory" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("idCategory")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "idPurchase" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("idPurchase")
);

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("idCategory") ON DELETE RESTRICT ON UPDATE CASCADE;
