import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  await prisma.user.deleteMany({});
  console.log('Cleared existing users');

  const testUsers = [
    { email: 'test1@example.com', name: 'Test User 1', password: 'Password123!' },
    { email: 'test2@example.com', name: 'Test User 2', password: 'Password123!' },
    { email: 'test3@example.com', name: 'Test User 3', password: 'Password123!' },
    { email: 'test4@example.com', name: 'Test User 4', password: 'Password123!' },
    { email: 'test5@example.com', name: 'Test User 5', password: 'Password123!' },
    { email: 'loadtest@example.com', name: 'Load Test User', password: 'Password123!' },
  ];

  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
      },
    });

    console.log(`Created user: ${userData.email}`);
  }

  console.log('Seeding statistics:');
  console.log(`Total users created: ${testUsers.length}`);
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
