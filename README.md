# Дипломний проєкт

Сучасна платформа для публікації та читання статей з елементами соціальної мережі. Проєкт побудований на базі мікросервісної архітектури з використанням NestJS та React.

## Технологічний стек

### Backend (Node.js)
* **Framework:** NestJS (TypeScript)
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Caching:** Redis
* **Storage:** MinIO (S3 compatible) для зображень
* **Mailing:** Resend / Mailtrap (Nodemailer)
* **Auth:** JWT + Passport.js

### Frontend (React)
* **Framework:** React v18 (Vite)
* **Styling:** Tailwind CSS
* **State Management:** Zustand
* **Data Fetching:** TanStack Query (React Query)
* **Icons:** Lucide React

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