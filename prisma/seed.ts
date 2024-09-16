// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Apagar dados das tabelas que possuem relações (começar pelas que dependem de outras)
  await prisma.dePara.deleteMany({})

  console.log('Todos os dados foram apagados.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
