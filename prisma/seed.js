/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  await prisma.item.createMany({
    data: [
      {
        id: 'item-seed-1',
        name: 'Classic White Tee',
        category: 'top',
        brand: 'Acme',
        price: 19.99,
        notes: 'Seed data',
        tags: [],
      },
      {
        id: 'item-seed-2',
        name: 'Everyday Mascara',
        category: 'eye',
        brand: 'BeautyCo',
        price: 12.0,
        notes: 'Seed makeup',
        tags: [],
      }
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
