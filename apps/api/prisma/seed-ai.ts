import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  let bot = await prisma.user.findUnique({
    where: { email: 'ai@hotelcapanaparo.com' }
  });

  if (!bot) {
    bot = await prisma.user.create({
      data: {
        email: 'ai@hotelcapanaparo.com',
        password: 'ai-reserved-no-login',
        firstName: 'CapaBot',
        lastName: 'AI'
      }
    });
  }

  console.log(`BOT_ID_START:${bot.id}:BOT_ID_END`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
