import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Inventory God-Level Data...');

  // 1. Create Professional Categories
  const categories = [
    { name: 'Lencería', icon: 'Bed' },
    { name: 'Amenities', icon: 'Sparkles' },
    { name: 'Limpieza', icon: 'Trash2' },
    { name: 'Alimentos y Bebidas', icon: 'Coffee' },
    { name: 'Mantenimiento', icon: 'Wrench' },
  ];

  for (const cat of categories) {
    await prisma.inventoryCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name, icon: cat.icon },
    });
  }

  const lenceria = await prisma.inventoryCategory.findUnique({ where: { name: 'Lencería' } });
  const amenities = await prisma.inventoryCategory.findUnique({ where: { name: 'Amenities' } });

  // 2. Create Sample items if table is empty
  const count = await prisma.inventoryRecord.count();
  if (count === 0) {
    await prisma.inventoryRecord.create({
      data: {
        sku: 'INV-TOA-9012',
        item: 'Toallas de Baño Premium',
        quantity: 50,
        unit: 'und',
        minStock: 15,
        costPrice: 12.50,
        categoryId: lenceria?.id,
        status: 'ok',
        transactions: {
          create: { type: 'IN', quantity: 50, reason: 'Initial Seed' }
        }
      }
    });

    await prisma.inventoryRecord.create({
      data: {
        sku: 'INV-SHA-4432',
        item: 'Shampoo 30ml (Caja 100und)',
        quantity: 5,
        unit: 'caja',
        minStock: 10,
        costPrice: 45.00,
        categoryId: amenities?.id,
        status: 'low',
        transactions: {
          create: { type: 'IN', quantity: 5, reason: 'Initial Seed' }
        }
      }
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
