echo "🚀 Запуск середовища розробки SkillShare..."
cd ../../backend

echo "Оновлення залежностей..."
npm install

echo "Генерація Prisma клієнта та міграції бази даних..."
npx prisma generate
npx prisma migrate dev

echo "Запуск NestJS сервера в режимі watch..."
npm run start:dev
