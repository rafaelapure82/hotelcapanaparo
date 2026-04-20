const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const userWithRoles = await prisma.user.findUnique({
      where: { email: 'luishotel@gmail.com' },
      include: { roles: true }
    });
    console.log('Luis User with Roles:', JSON.stringify(userWithRoles, null, 2));
    
  } catch (err) {
    console.error('Error checking DB:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
