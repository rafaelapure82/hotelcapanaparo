import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding 5 Premium Suites ---');

  // 1. Find or create a default host user
  let user = await prisma.user.findFirst({
    where: { 
      OR: [
        { email: { contains: 'host' } },
        { email: { contains: 'admin' } }
      ]
    }
  });

  if (!user) {
    user = await prisma.user.findFirst();
  }

  if (!user) {
    console.log('No users found. Creating a default admin user...');
    user = await prisma.user.create({
      data: {
        email: 'admin@hotelcapanaparo.com',
        firstName: 'Administrador',
        lastName: 'Capanaparo',
        password: 'password123', // In a real system, use hash
        roles: {
          create: {
            slug: 'admin',
            name: 'Administrador'
          }
        }
      }
    });
    console.log(`Created admin user: ${user.email}`);
  }

  const suites = [
    {
      title: 'Imperial Sabana Suite',
      basePrice: 250,
      city: 'Apure',
      address: 'Hato Capanaparo, Sector La Macanilla',
      content: 'Nuestra suite más exclusiva con vistas panorámicas a la sabana. Disfrute del lujo absoluto con atención personalizada y acabados de primera calidad.',
      maxGuests: 2,
      bedType: 'King Size Premium',
      size: 120,
      amenities: ['wifi', 'tv', 'ac', 'pool', 'breakfast', 'minibar', 'hot_water'],
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200'
      ]),
      status: 'publish'
    },
    {
      title: 'Deluxe Pool View Room',
      basePrice: 135,
      city: 'Apure',
      address: 'Hato Capanaparo, Ala Sur',
      content: 'Habitación elegante con acceso directo y vista a la piscina principal. Ideal para parejas que buscan confort y frescura.',
      maxGuests: 2,
      bedType: 'Queen Size',
      size: 45,
      amenities: ['wifi', 'tv', 'ac', 'pool', 'breakfast'],
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200'
      ]),
      status: 'publish'
    },
    {
      title: 'Family Safari Bungalow',
      basePrice: 195,
      city: 'Apure',
      address: 'Zona de Bosque, cabaña #4',
      content: 'Cabaña independiente perfecta para familias. Rodeada de naturaleza, ofrece la experiencia auténtica del llano venezolano.',
      maxGuests: 4,
      bedType: '1 King + 2 Twin',
      size: 95,
      amenities: ['wifi', 'tv', 'ac', 'breakfast', 'parking'],
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&q=80&w=1200'
      ]),
      status: 'publish'
    },
    {
      title: 'Executive Business Center Room',
      basePrice: 95,
      city: 'Elorza',
      address: 'Centro, Elorza',
      content: 'Habitación optimizada para el viajero de negocios. Silenciosa, con escritorio ergonómico y el internet más rápido de la región.',
      maxGuests: 1,
      bedType: 'Twin XL',
      size: 30,
      amenities: ['wifi', 'ac', 'breakfast', 'parking'],
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1200'
      ]),
      status: 'publish'
    },
    {
      title: 'Romantic River-Front Cabin',
      basePrice: 165,
      city: 'Apure',
      address: 'Orilla del Río Capanaparo',
      content: 'Cabina privada construida con madera local a la orilla del río. Disfrute del sonido del agua y los amaneceres más bellos.',
      maxGuests: 2,
      bedType: 'King Size',
      size: 60,
      amenities: ['wifi', 'ac', 'breakfast', 'hot_water', 'minibar'],
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200'
      ]),
      status: 'publish'
    }
  ];

  for (const suite of suites) {
    const slug = suite.title.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(7);
    await prisma.home.create({
      data: {
        ...suite,
        slug,
        author: { connect: { id: user.id } }
      }
    });
    console.log(`Created: ${suite.title}`);
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
