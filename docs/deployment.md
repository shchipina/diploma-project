# Посібник з розгортання у Production (Deployment Guide)

## 1. Вимоги до апаратного забезпечення

Для стабільної роботи платформи (NestJS + PostgreSQL + Redis на одному сервері) мінімальні вимоги до сервера наступні:

- **Архітектура:** x86_64 або ARM64
- **CPU:** Мінімум 2 vCPU (рекомендовано 4 vCPU для високого навантаження)
- **RAM:** Мінімум 4 GB (рекомендовано 8 GB для in-memory кешування Redis)
- **Disk:** 30+ GB SSD (швидкість диска критична для бази даних)
- **OS:** Ubuntu 22.04 LTS (або новіша)

---

## 2. Необхідне програмне забезпечення

Перед початком розгортання переконайтеся, що на сервері встановлені такі компоненти:

1. **Node.js** (версія 18.x або 20.x) та **npm**.
2. **PM2** (Менеджер процесів для Node.js):
   ```bash
   npm install -g pm2
   ```
3. **PostgreSQL** (версія 14 або вище).
4. **Redis Server** (остання стабільна версія).
5. **Git** (для отримання коду з репозиторію).

---

## 3. Налаштування мережі

Оскільки в поточній конфігурації не використовується reverse-proxy (Nginx), додаток безпосередньо приймає підключення. Необхідно налаштувати брандмауер (UFW), щоб захистити бази даних від доступу ззовні.

Відкриваємо лише необхідні порти:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp       # Доступ для SSH
sudo ufw allow 3000/tcp     # Порт нашого NestJS бекенду (API)
sudo ufw enable
```

> **Увага:** Порти PostgreSQL (5432) та Redis (6379) залишаються закритими для зовнішнього світу. Доступ до них має лише локальний додаток (127.0.0.1).

---

## 4. Налаштування СУБД та Кешування

Перед розгортанням коду необхідно підготувати бази даних:

### PostgreSQL

Створіть базу даних та користувача з надійним паролем:

```sql
CREATE DATABASE skillshare_prod;
CREATE USER skillshare_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE skillshare_prod TO skillshare_user;
```

### Redis

Переконайтеся, що сервіс Redis працює і доданий в автозавантаження:

```bash
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

---

## 5. Конфігурація серверів (Змінні оточення)

Створіть папку для проєкту, наприклад `/var/www/skillshare/backend`, і всередині створіть файл `.env` із Production-даними:

```env
# /var/www/skillshare/backend/.env
NODE_ENV="production"
PORT=3000

# Підключення до БД (замініть дані на свої)
DATABASE_URL="postgresql://skillshare_user:your_secure_password@127.0.0.1:5432/skillshare_prod?schema=public"

# Налаштування Redis
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Секрети для JWT токенів
JWT_ACCESS_SECRET="generate_very_long_random_string_here"
JWT_REFRESH_SECRET="generate_another_long_random_string_here"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Налаштування безпеки
FRONTEND_URL="[http://your-frontend-domain.com](http://your-frontend-domain.com)"
COOKIE_DOMAIN="your-domain.com"
COOKIE_SECURE="true"
```

---

## 6. Розгортання коду (Deployment Steps)

Перейдіть до директорії проєкту та виконайте наступні команди:

Отримання коду з репозиторію:

```bash
git pull origin main
```

Встановлення залежностей (суворо по lock-файлу):

```bash
npm ci --only=production
```

Застосування міграцій Prisma (створення таблиць у БД):

```bash
npx prisma generate
npx prisma migrate deploy
```

Збірка проєкту (TypeScript -> JavaScript):

```bash
npm run build
```

Запуск додатку через PM2:

```bash
pm2 start dist/main.js --name "skillshare-api"
```

Збереження конфігурації PM2 для автозапуску після рестарту сервера:

```bash
pm2 save
pm2 startup
```

---

## 7. Перевірка працездатності (Health Check)

Як зрозуміти, що розгортання пройшло успішно і все працює:

Перевірка статусу процесу в PM2:

```bash
pm2 status skillshare-api
```

_Статус має бути "online", а лічильник рестартів (restarts) — 0._

Перевірка логів на наявність помилок:

```bash
pm2 logs skillshare-api --lines 50
```

HTTP-перевірка доступності API:
Виконайте запит з самого сервера або з зовнішнього комп'ютера:

```bash
curl -I http://IP_АДРЕСА_СЕРВЕРА:3000/
```

_Очікуваний результат: `HTTP/1.1 200 OK`._
