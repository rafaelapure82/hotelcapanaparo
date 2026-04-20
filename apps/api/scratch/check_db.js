const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true }
    });
    console.log('Users:', JSON.stringify(users, null, 2));
    
    const bookings = await prisma.booking.findMany({
      include: { home: { select: { title: true } } }
    });
    console.log('Bookings:', JSON.stringify(bookings, null, 2));
    
  } catch (err) {
    console.error('Error checking DB:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
