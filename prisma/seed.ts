import * as PrismaPkg from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PrismaClient = (PrismaPkg as any).PrismaClient as new () => any;
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing items (optional; comment out if you want to preserve data)
  // await prisma.item.deleteMany({});

  const items = await prisma.item.createMany({
    data: [
      {
        id: 'item-seed-casual-tee',
        name: 'Classic White Tee',
        category: 'top',
        subCategory: 'tee',
        color: 'white',
        brand: 'Acme Co.',
        size: 'M',
        price: 19.99,
        notes: 'Comfortable everyday tee (seed data)',
        tags: ['casual', 'versatile'],
      },
      {
        id: 'item-seed-jeans',
        name: 'Blue Denim Jeans',
        category: 'bottom',
        subCategory: 'jeans',
        color: 'blue',
        brand: 'DenimCo',
        size: '30x32',
        price: 79.99,
        notes: 'Classic fit jeans (seed data)',
        tags: ['casual', 'staple'],
      },
      {
        id: 'item-seed-mascara',
        name: 'Everyday Mascara',
        category: 'eye',
        color: 'black',
        brand: 'BeautyBrand',
        price: 12.0,
        notes: 'Long-wear mascara formula (seed data)',
        tags: ['makeup', 'eye'],
      },
      {
        id: 'item-seed-lipstick',
        name: 'Matte Red Lipstick',
        category: 'lip',
        color: 'red',
        brand: 'LipCo',
        price: 8.99,
        notes: 'Long-lasting matte finish (seed data)',
        tags: ['makeup', 'lip', 'red'],
      },
    ],
    skipDuplicates: true,
  });

  console.log(`Seeded ${items.count} items`);

  // Create a sample Look that references seeded items
  const look = await prisma.look.create({
    data: {
      id: 'look-seed-casual',
      name: 'Casual Everyday',
      notes: 'Simple and comfortable outfit',
      items: {
        connect: [
          { id: 'item-seed-casual-tee' },
          { id: 'item-seed-jeans' },
        ],
      },
    },
  });

  console.log(`Created look: ${look.name}`);
  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
