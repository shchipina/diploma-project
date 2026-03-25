echo "Розпочинаємо процес розгортання у PRODUCTION..."

cd /var/www/skillshare/backend || exit

echo "Зупинка поточного процесу API..."
pm2 stop skillshare-api || true

echo "Отримання останніх оновлень з репозиторію..."
git pull origin main

echo "Встановлення залежностей (чисте встановлення)..."
npm ci --only=production

echo "Застосування міграцій до бази даних..."
npx prisma generate
npx prisma migrate deploy

echo "Збірка проєкту..."
npm run build

echo "Запуск додатку через PM2..."
pm2 start dist/main.js --name "skillshare-api"
pm2 save

echo "Розгортання успішно завершено! Поточний статус:"
pm2 status skillshare-api
