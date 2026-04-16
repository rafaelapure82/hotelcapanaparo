import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed started...');

  // 1. Create Roles
  const adminRole = await prisma.role.upsert({
    where: { slug: 'admin' },
    update: {},
    create: {
      slug: 'admin',
      name: 'Administrator',
      permissions: 'all',
    },
  });

  const partnerRole = await prisma.role.upsert({
    where: { slug: 'partner' },
    update: {},
    create: {
      slug: 'partner',
      name: 'Hotel Partner',
      permissions: 'manage_homes,view_bookings',
    },
  });

  const guestRole = await prisma.role.upsert({
    where: { slug: 'guest' },
    update: {},
    create: {
      slug: 'guest',
      name: 'Guest',
      permissions: 'view_bookings,create_review',
    },
  });


  console.log('Roles created.');

  // 2. Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@capanaparo.com' },
    update: {},
    create: {
      email: 'admin@capanaparo.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Capanaparo',
      roles: {
        connect: [{ id: adminRole.id }],
      },
    },
  });

  console.log('Admin user created.');

  // 3. Create Suites (Homes)
  const suites = [
    {
      slug: 'suite-presidencial-rio-capanaparo',
      title: 'Suite Presidencial Río Capanaparo',
      description: 'Nuestra suite más lujosa con vista panorámica al río andino. Elegancia pura y confort total.',
      content: 'Incluye jacuzzi privado, cama king size, minibar premium y servicio de habitación 24/7.',
      basePrice: 250,
      numberOfGuest: 2,
      numberOfBedrooms: 1,
      numberOfBathrooms: 1,
      city: 'Apure',
      country: 'Venezuela',
      amenities: 'Wifi, A/C, Jacuzzi, Breakfast',
      homeType: 'Suite',
    },
    {
      slug: 'junior-suite-sabana-dorada',
      title: 'Junior Suite Sabana Dorada',
      description: 'Elegancia y calidez con toques minimalistas inspirados en los atardeceres llaneros.',
      content: 'Perfecta para estancias de negocios o escapadas románticas.',
      basePrice: 150,
      numberOfGuest: 2,
      numberOfBedrooms: 1,
      numberOfBathrooms: 1,
      city: 'Apure',
      country: 'Venezuela',
      amenities: 'Wifi, A/C, Desk, TV',
      homeType: 'Junior Suite',
    },
    {
      slug: 'habitacion-ejecutiva-llano-alto',
      title: 'Habitación Ejecutiva Llano Alto',
      description: 'Funcionalidad y diseño en el corazón del Hotel Capanaparo Suites.',
      content: 'Equipada con la última tecnología para el viajero moderno.',
      basePrice: 95,
      numberOfGuest: 2,
      numberOfBedrooms: 1,
      numberOfBathrooms: 1,
      city: 'Apure',
      country: 'Venezuela',
      amenities: 'Wifi, A/C, Workstation',
      homeType: 'Standard',
    },
  ];

  for (const suite of suites) {
    await prisma.home.upsert({
      where: { slug: suite.slug },
      update: {},
      create: {
        ...suite,
        authorId: adminUser.id,
      },
    });
  }

  console.log('Suites seeded successfully.');
  console.log('Seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
