# 🚀 Інструкція з налаштування інфраструктури проєкту

## 📋 Зміст

1. [Встановлення залежностей](#встановлення-залежностей)
2. [Ініціалізація Husky](#ініціалізація-husky)
3. [Встановлення пакетів для Prettier у frontend](#встановлення-prettier-у-frontend)
4. [Використання](#використання)
5. [Приклади коммітів](#приклади-коммітів)
6. [Абсолютні імпорти](#абсолютні-імпорти)

---

## 1️⃣ Встановлення залежностей

### Корінь проєкту

```bash
npm install
```

Ця команда встановить:

- `husky` - Git hooks менеджер
- `lint-staged` - Утиліта для запуску лінтерів на staged файлах
- `@commitlint/cli` та `@commitlint/config-conventional` - Для перевірки формату коммітів
- `prettier` - Форматування коду

### Frontend

```bash
cd frontend
npm install prettier eslint-plugin-prettier eslint-config-prettier --save-dev
cd ..
```

### Backend

Backend вже має всі необхідні залежності для Prettier та ESLint.

---

## 2️⃣ Ініціалізація Husky

```bash
npm run prepare
```

Ця команда:

- Ініціалізує Husky
- Налаштує Git hooks (.husky/pre-commit та .husky/commit-msg)

### Перевірка встановлення Husky

Після виконання команди `npm run prepare`, перевірте наявність папки `.husky` в корені проєкту з файлами:

- `pre-commit` - Запускає lint-staged перед кожним коммітом
- `commit-msg` - Перевіряє формат повідомлення коміту

---

## 3️⃣ Структура проєкту

```
diploma/
├── .editorconfig           # Налаштування редактора
├── .nvmrc                  # Версія Node.js (18.20.0)
├── .prettierrc             # Конфігурація Prettier
├── .prettierignore         # Ігноровані файли для Prettier
├── .lintstagedrc.json      # Конфігурація lint-staged
├── commitlint.config.mjs   # Конфігурація commitlint
├── package.json            # Root package.json з workspaces
├── .husky/
│   ├── pre-commit          # Hook для lint-staged
│   └── commit-msg          # Hook для commitlint
├── backend/
│   ├── eslint.config.mjs   # ESLint конфігурація (з Prettier)
│   ├── tsconfig.json       # TypeScript з абсолютними імпортами
│   └── src/
│       └── main.ts         # Swagger налаштування
└── frontend/
    ├── eslint.config.js    # ESLint конфігурація (з Prettier)
    ├── tsconfig.app.json   # TypeScript з абсолютними імпортами
    └── vite.config.ts      # Vite з алісами шляхів
```

---

## 4️⃣ Використання

### Форматування коду

```bash
npm run format

npm run format:check
```

### Лінтінг

```bash
npm run lint
npm run lint:fix
cd backend && npm run lint
cd frontend && npm run lint
```

### Запуск проєктів

```bash
npm run dev:frontend

npm run dev:backend

cd frontend && npm run dev
cd backend && npm run start:dev
```

### Build проєктів

```bash
npm run build:frontend
npm run build:backend
```

---

## 5️⃣ Приклади коммітів

### ✅ Правильні коміти

```bash
# Feature з номером задачі
git commit -m "feat(auth): add JWT authentication [OPENDATA-507]"

# Bug fix
git commit -m "fix(api): resolve CORS issue in production [OPENDATA-508]"

# Рефакторинг
git commit -m "refactor(users): optimize database queries [OPENDATA-510]"

# Документація
git commit -m "docs: update README with deployment instructions"

# Стилі коду
git commit -m "style(frontend): format all React components"

# Тести
git commit -m "test(auth): add unit tests for login controller [OPENDATA-512]"

# Chore (maintenance)
git commit -m "chore: update dependencies to latest versions"

# CI/CD
git commit -m "ci: add GitHub Actions workflow for tests"
```

### ❌ Неправильні коміти (будуть відхилені)

```bash
# Немає type
git commit -m "add authentication"

# Великі літери на початку subject
git commit -m "feat: Add authentication"

# Неправильний type
git commit -m "added: authentication feature"

# Порожнє повідомлення
git commit -m ""
```

### Формат коміту

```
<type>(<scope>): <subject> [TASK-ID]

<body> (опціонально)

<footer> (опціонально)
```

**Типи (type):**

- `feat` - Нова функціональність
- `fix` - Виправлення бага
- `docs` - Зміни в документації
- `style` - Форматування коду (не впливає на логіку)
- `refactor` - Рефакторинг коду
- `perf` - Покращення продуктивності
- `test` - Додавання або оновлення тестів
- `build` - Зміни в системі збірки або залежностях
- `ci` - Зміни в CI/CD
- `chore` - Інші зміни (обслуговування)
- `revert` - Відміна попереднього коміту

**Scope (опціонально):**

- `auth` - Аутентифікація
- `api` - API endpoints
- `users` - Користувачі
- `skills` - Навички
- `frontend` - Frontend
- `backend` - Backend

---

## 6️⃣ Абсолютні імпорти

### Backend (NestJS)

Доступні аліаси:

```typescript
// Замість: import { UserService } from '../../../modules/user/user.service'
import { UserService } from '@modules/user/user.service';

// Замість: import { config } from '../../config/database'
import { config } from '@config/database';

// Інші аліаси:
import something from '@/...'; // src/
import utils from '@utils/...'; // src/utils/
import common from '@common/...'; // src/common/
```

### Frontend (React + Vite)

Доступні аліаси:

```typescript
// Замість: import Button from '../../../components/Button'
import Button from '@components/Button';

// Замість: import { useAuth } from '../../hooks/useAuth'
import { useAuth } from '@hooks/useAuth';

// Інші аліаси:
import something from '@/...'; // src/
import Page from '@pages/...'; // src/pages/
import utility from '@utils/...'; // src/utils/
import api from '@services/...'; // src/services/
import store from '@store/...'; // src/store/
import type from '@types/...'; // src/types/
import image from '@assets/...'; // src/assets/
```

---

## 7️⃣ Swagger API Documentation

Після запуску backend сервера, документація API буде доступна за адресою:

```
http://localhost:3000/api/docs
```

### Використання Swagger у контролерах

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users') // Група endpoints у Swagger
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users' })
  findAll() {
    // ...
  }

  @Post()
  @ApiBearerAuth('JWT-auth') // Вимагає JWT токен
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() createUserDto: CreateUserDto) {
    // ...
  }
}
```

---

## 8️⃣ Корисні команди

```bash
# Перевірити версію Node.js (має бути >= 18.20.0)
node -v

# Використання nvm для встановлення правильної версії Node.js
nvm use

# Перевірити статус Git та staged файли
git status

# Додати файли для коміту
git add .

# Commit (автоматично запуститься lint-staged та commitlint)
git commit -m "feat(auth): add login endpoint [OPENDATA-507]"

# Якщо потрібно пропустити hooks (НЕ РЕКОМЕНДУЄТЬСЯ)
git commit -m "..." --no-verify
```

---

## 9️⃣ Troubleshooting

### Проблема: Husky hooks не працюють

**Рішення:**

```bash
rm -rf .husky
npm run prepare
```

### Проблема: Prettier конфліктує з ESLint

**Рішення:**

- Всі конфігурації вже налаштовані з `eslint-plugin-prettier/recommended`
- Якщо виникають проблеми, перевірте, що встановлені пакети:

  ```bash
  # Backend
  cd backend && npm list eslint-plugin-prettier eslint-config-prettier

  # Frontend
  cd frontend && npm list eslint-plugin-prettier eslint-config-prettier
  ```

### Проблема: Абсолютні імпорти не працюють

**Backend:**

- Перезапустіть TypeScript server у VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
- Перевірте, що встановлений `tsconfig-paths`

**Frontend:**

- Перезапустіть Vite dev server
- Перевірте файли `tsconfig.app.json` та `vite.config.ts`

### Проблема: lint-staged падає при комміті

**Рішення:**

```bash
# Очистити кеш
npm cache clean --force

# Переустановити залежності
rm -rf node_modules
npm install
```

---

## 🎯 Додаткові рекомендації

1. **EditorConfig**: Переконайтеся, що у вашому редакторі встановлений плагін EditorConfig
2. **VS Code розширення**:
   - ESLint
   - Prettier - Code formatter
   - EditorConfig for VS Code
3. **Git**: Завжди перевіряйте форматування перед push:
   ```bash
   npm run format:check && npm run lint
   ```

---

## 📚 Корисні посилання

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Prettier Documentation](https://prettier.io/)
- [ESLint Documentation](https://eslint.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)

---

**Автор:** Diploma Project - Skill & Knowledge Sharing Platform  
**Версія:** 1.0.0  
**Останнє оновлення:** 2026-03-25
