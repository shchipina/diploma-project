# Дипломний проєкт

Сучасна платформа для публікації та читання статей з елементами соціальної мережі. Проєкт побудований на базі мікросервісної архітектури з використанням NestJS та React.

## Технологічний стек

### Backend (Node.js)

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Caching:** Redis
- **Storage:** MinIO (S3 compatible) для зображень
- **Mailing:** Resend / Mailtrap (Nodemailer)
- **Auth:** JWT + Passport.js

### Frontend (React)

- **Framework:** React v18 (Vite)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Icons:** Lucide React

## Структура проєкту

```text
diploma/
├── backend/                # Серверна частина
│   ├── src/                # Логіка додатку
│   ├── prisma/             # Схема БД та міграції
│   └── .env.example        # Налаштування оточення
├── frontend/               # Клієнтська частина (React)
│   ├── src/                # Компоненти та сторінки
│   └── vite.config.ts      # Конфігурація Vite (Proxy setup)
├── docker-compose.yml      # Контейнеризація (DB, Redis, MinIO)
└── README.md               # Документація проєкту
```

### 1. Необхідне ПЗ

- **Git**, **Node.js** (v18.x або v20.x), **npm**
- **PostgreSQL** (v14+)
- **Redis** (локально або через Docker: `docker run -d -p 6379:6379 redis`)

### 2. Клонування та встановлення залежностей

```bash
git clone [https://github.com/your-repo/skillshare.git](https://github.com/your-repo/skillshare.git)
cd skillshare

# Встановлення залежностей для бекенду
cd backend && npm install

# Встановлення залежностей для фронтенду
cd ../frontend && npm install

```

## Налаштування середовища та БД

У папці backend створіть файл .env, приклад:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/database_name?schema=public"
JWT_ACCESS_SECRET="your-super-secret-access-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
COOKIE_DOMAIN="localhost"
COOKIE_SECURE="false"
```

Виконайте міграції:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Запуск проєкту
   Бекенд: npm run start:dev (порт 3000)

Фронтенд: npm run dev (порт 5173)
Або скористайтеся скриптом docs/scripts/start-dev.sh
