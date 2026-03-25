# ⚡ Швидкий старт

## 📦 Встановлення

```bash
npm install

cd frontend
npm install prettier eslint-plugin-prettier eslint-config-prettier --save-dev
cd ..

npm run prepare
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## 🚀 Запуск

```bash
npm run dev:frontend
npm run dev:backend
```

## ✅ Перевірка налаштувань

```bash
npm run format:check
npm run lint
git add .
git commit -m "chore: test commit hooks"
```

## 📖 Повна документація

Детальна інструкція у файлі [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)

---

## Приклади правильних коммітів

```bash
git commit -m "feat(auth): add JWT authentication [OPENDATA-507]"
git commit -m "fix(api): resolve CORS issue [OPENDATA-508]"
git commit -m "docs: update README with setup instructions"
git commit -m "refactor(users): optimize database queries [OPENDATA-510]"
```

## Абсолютні імпорти

**Backend:**

```typescript
import { UserService } from '@modules/user/user.service';
import { config } from '@config/database';
```

**Frontend:**

```typescript
import Button from '@components/Button';
import { useAuth } from '@hooks/useAuth';
import api from '@services/api';
```
