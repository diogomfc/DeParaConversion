-- CreateTable
CREATE TABLE "de_para" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT,
    "arquivoCSV" JSONB,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,
    "generationDDLId" INTEGER,

    CONSTRAINT "de_para_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ddl_generation" (
    "id" SERIAL NOT NULL,
    "version" TEXT,
    "fileName" TEXT,
    "data" JSONB,
    "description" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deParaId" INTEGER NOT NULL,

    CONSTRAINT "ddl_generation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "de_para_status_idx" ON "de_para"("status");

-- CreateIndex
CREATE INDEX "de_para_generationDDLId_idx" ON "de_para"("generationDDLId");

-- CreateIndex
CREATE UNIQUE INDEX "ddl_generation_deParaId_key" ON "ddl_generation"("deParaId");

-- CreateIndex
CREATE INDEX "ddl_generation_deParaId_idx" ON "ddl_generation"("deParaId");

-- CreateIndex
CREATE INDEX "ddl_generation_fileName_idx" ON "ddl_generation"("fileName");

-- CreateIndex
CREATE INDEX "ddl_generation_version_idx" ON "ddl_generation"("version");

-- AddForeignKey
ALTER TABLE "ddl_generation" ADD CONSTRAINT "ddl_generation_deParaId_fkey" FOREIGN KEY ("deParaId") REFERENCES "de_para"("id") ON DELETE CASCADE ON UPDATE CASCADE;
