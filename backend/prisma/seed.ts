import 'dotenv/config';
import { PrismaClient, PublicationStatus, Role } from '../generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TAGS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'React',
  'NestJS',
  'Node.js',
  'Machine Learning',
  'DevOps',
  'Docker',
  'PostgreSQL',
  'UI/UX',
  'Дизайн',
  "Кар'єра",
  'Продуктивність',
  'AI',
  'Web3',
  'Go',
  'Rust',
  'Кібербезпека',
  'Mobile',
];

interface UserSeed {
  email: string;
  role: Role;
}

const USERS: UserSeed[] = [
  { email: 'admin@skillshare.ua', role: Role.ADMIN },
  { email: 'maria.koval@gmail.com', role: Role.USER },
  { email: 'oleksandr.shevchenko@gmail.com', role: Role.USER },
  { email: 'sofia.bondar@gmail.com', role: Role.USER },
  { email: 'dmytro.kozak@gmail.com', role: Role.USER },
  { email: 'anna.lysenko@gmail.com', role: Role.USER },
  { email: 'ivan.melnyk@gmail.com', role: Role.USER },
  { email: 'yulia.tkachenko@gmail.com', role: Role.USER },
];

interface PubSeed {
  title: string;
  description: string;
  status: PublicationStatus;
  viewCount: number;
  tags: string[];
  authorIdx: number;
  daysAgo: number;
  imageUrl: string | null;
}

const PUBLICATIONS: PubSeed[] = [
  {
    title: 'TypeScript 6.0: все що потрібно знати розробнику',
    description:
      'Огляд нових можливостей TypeScript 6.0 — покращена типова система, декоратори нового покоління, швидша компіляція та нові утиліти типів. Міграційний гайд з попередніх версій з прикладами коду та поясненнями кожної зміни.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1842,
    tags: ['TypeScript', 'JavaScript'],
    authorIdx: 1,
    daysAgo: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=400&fit=crop',
  },
  {
    title: 'Побудова масштабованого RAG Pipeline продакшн-рівня',
    description:
      'Детальний практичний гайд з побудови Retrieval-Augmented Generation пайплайну для продакшн-середовища. Розглянемо автоскейлінг, оцінку якості відповідей, AI Compute Workflows, векторні бази даних та оптимізацію latency.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 2305,
    tags: ['AI', 'Python', 'Machine Learning'],
    authorIdx: 2,
    daysAgo: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop',
  },
  {
    title: 'React Server Components: глибоке занурення',
    description:
      'Розбираємо внутрішню архітектуру React Server Components — як вони працюють під капотом, в чому відмінність від SSR, які патерни використовувати, коли обирати client vs server компоненти та як це впливає на продуктивність.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1567,
    tags: ['React', 'JavaScript', 'TypeScript'],
    authorIdx: 3,
    daysAgo: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop',
  },
  {
    title: 'NestJS + Prisma: повний гайд з нуля до продакшену',
    description:
      'Створюємо повноцінний REST API з NestJS та Prisma ORM. Від налаштування проєкту до деплою — авторизація JWT, валідація, Swagger документація, Docker, міграції бази даних та CI/CD пайплайн.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 3210,
    tags: ['NestJS', 'TypeScript', 'PostgreSQL', 'Docker'],
    authorIdx: 4,
    daysAgo: 5,
    imageUrl:
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=400&fit=crop',
  },
  {
    title: 'Як я перейшла з менеджменту в розробку за 6 місяців',
    description:
      "Мій особистий досвід кар'єрного повороту. Які ресурси використовувала, з якими викликами стикнулась, чому обрала фронтенд, скільки коштувало навчання і чому ніколи не пізно почати щось нове у своєму житті.",
    status: PublicationStatus.PUBLISHED,
    viewCount: 4521,
    tags: ["Кар'єра", 'Продуктивність'],
    authorIdx: 5,
    daysAgo: 6,
    imageUrl: null,
  },
  {
    title:
      'Docker Compose для розробників: від новачка до впевненого користувача',
    description:
      'Практичний курс по Docker Compose — мульти-контейнерні додатки, мережі, volumes, health checks, secrets. Реальні приклади з PostgreSQL, Redis, MinIO та NestJS. Все що потрібно для комфортної локальної розробки.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1923,
    tags: ['Docker', 'DevOps', 'Node.js'],
    authorIdx: 6,
    daysAgo: 7,
    imageUrl:
      'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=400&fit=crop',
  },
  {
    title: 'Мікроінтеракції, які підвищують конверсію на 40%',
    description:
      'Дослідження впливу анімацій та мікро-взаємодій на поведінку користувачів у веб-застосунках. Розглянемо конкретні кейси з A/B тестування, бібліотеки для реалізації та метрики для вимірювання ефективності.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 2876,
    tags: ['UI/UX', 'Дизайн', 'React'],
    authorIdx: 7,
    daysAgo: 8,
    imageUrl:
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=400&fit=crop',
  },
  {
    title: 'PostgreSQL: просунуті техніки оптимізації запитів',
    description:
      'Розбираємо EXPLAIN ANALYZE, індекси (B-tree, GIN, GiST), партиціонування таблиць, CTEs vs subqueries, materialized views та pg_stat_statements. Реальні кейси оптимізації з 10 секунд до 50 мілісекунд.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1654,
    tags: ['PostgreSQL', 'DevOps'],
    authorIdx: 2,
    daysAgo: 9,
    imageUrl: null,
  },
  {
    title: 'AI Агенти: від концепції до продакшену',
    description:
      "Повний курс по створенню AI агентів — архітектура, LangChain, інструменти, пам'ять, планування, мультиагентні системи. Від простого чат-бота до автономного помічника, який вирішує складні задачі.",
    status: PublicationStatus.PUBLISHED,
    viewCount: 5123,
    tags: ['AI', 'Python', 'Machine Learning'],
    authorIdx: 1,
    daysAgo: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=400&fit=crop',
  },
  {
    title: 'Трансформери у 2026: від GPT до мультимодальних систем',
    description:
      'Еволюція архітектур трансформерів за останні роки. Порівняння GPT, Claude, Gemini, Llama — архітектурні рішення, навчання, fine-tuning. Як мультимодальність змінює ландшафт AI та що очікувати далі.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 3891,
    tags: ['AI', 'Machine Learning'],
    authorIdx: 5,
    daysAgo: 10,
    imageUrl:
      'https://images.unsplash.com/photo-1676299081847-824916de030a?w=400&h=400&fit=crop',
  },
  {
    title: 'Кібербезпека для розробників: топ-10 вразливостей OWASP 2026',
    description:
      'Оновлений список OWASP Top 10 з практичними прикладами для кожної вразливості. SQL injection, XSS, CSRF, SSRF, broken authentication — як тестувати та як захищатися. Інструменти для автоматичного сканування.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 2134,
    tags: ['Кібербезпека', 'Node.js', 'DevOps'],
    authorIdx: 6,
    daysAgo: 11,
    imageUrl: null,
  },
  {
    title: 'Go для бекенд-розробників: перші 30 днів',
    description:
      'Мій досвід вивчення Go після 5 років з Node.js. Горутини, канали, інтерфейси, обробка помилок, пакетний менеджмент. Порівняння з TypeScript/NestJS — де Go виграє і де програє. Проєкт-вправа з REST API.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1298,
    tags: ['Go', "Кар'єра"],
    authorIdx: 4,
    daysAgo: 12,
    imageUrl:
      'https://images.unsplash.com/photo-1515879218367-8466d910auj7?w=400&h=400&fit=crop',
  },
  {
    title: 'Продуктивність розробника: система, а не мотивація',
    description:
      'Чому системний підхід до роботи перемагає натхнення. Deep work блоки, Pomodoro 2.0, цифровий мінімалізм, інструменти для фокусу. Мої ритуали та як я подвоїв свою продуктивність без вигорання.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 3456,
    tags: ['Продуктивність', "Кар'єра"],
    authorIdx: 3,
    daysAgo: 13,
    imageUrl: null,
  },
  {
    title: 'Rust для системного програмування: практичний вступ',
    description:
      "Ownership, borrowing, lifetimes — головні концепції Rust простими словами. Створюємо CLI утиліту та невеликий HTTP сервер. Порівняння з C++ та Go за продуктивністю та безпекою пам'яті.",
    status: PublicationStatus.PUBLISHED,
    viewCount: 987,
    tags: ['Rust'],
    authorIdx: 7,
    daysAgo: 14,
    imageUrl:
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=400&fit=crop',
  },
  {
    title: 'Web3 у 2026: що залишилось після хайпу',
    description:
      'Тверезий погляд на блокчейн-технології після криптозими. DeFi, NFT utility, DAOs, RWA токенізація — що реально працює і приносить цінність. Технічний розбір Solidity та смарт-контрактів для скептиків.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1765,
    tags: ['Web3', 'JavaScript'],
    authorIdx: 2,
    daysAgo: 15,
    imageUrl: null,
  },
  {
    title: 'React Native vs Flutter: що обрати у 2026 році',
    description:
      'Детальне порівняння двох фреймворків для мобільної розробки. Продуктивність, екосистема, DX, hot reload, нативні модулі, розмір бандлу. Реальний досвід команди з 3 проєктами на кожному фреймворку.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 2543,
    tags: ['Mobile', 'React', 'JavaScript'],
    authorIdx: 1,
    daysAgo: 16,
    imageUrl:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop',
  },
  {
    title: 'Дизайн-система з нуля: від токенів до компонентів',
    description:
      'Покроковий гайд з створення дизайн-системи для продуктової команди. Design tokens, Figma variables, Storybook, автоматична генерація документації. Як забезпечити консистентність між дизайном та кодом.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1432,
    tags: ['UI/UX', 'Дизайн', 'React', 'TypeScript'],
    authorIdx: 7,
    daysAgo: 17,
    imageUrl:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop',
  },
  {
    title: "Доступність — це не опція, а обов'язок",
    description:
      'Практичний гайд з WCAG 2.2 для фронтенд-розробників. Семантичний HTML, ARIA, фокус-менеджмент, контраст, screen readers. Як автоматизувати тестування доступності та інтегрувати його в CI/CD.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1123,
    tags: ['UI/UX', 'React'],
    authorIdx: 3,
    daysAgo: 18,
    imageUrl: null,
  },
  {
    title: 'Kubernetes для початківців: перший кластер за годину',
    description:
      'Від docker-compose до Kubernetes. Pods, Services, Deployments, Ingress — все на прикладі реального NestJS додатку. Використовуємо k3s для локальної розробки та Helm для управління конфігурацією.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1876,
    tags: ['DevOps', 'Docker', 'Node.js'],
    authorIdx: 6,
    daysAgo: 19,
    imageUrl:
      'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=400&fit=crop',
  },
  {
    title: 'Python для Data Engineering: Apache Spark та Airflow',
    description:
      'Як побудувати надійний ETL пайплайн з Apache Spark та Airflow. Обробка терабайтів даних, scheduler, retry логіка, моніторинг. Реальний кейс з міграції даних для e-commerce платформи.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1345,
    tags: ['Python', 'DevOps'],
    authorIdx: 5,
    daysAgo: 20,
    imageUrl: null,
  },
  {
    title: 'Як ефективно проходити технічні співбесіди у 2026',
    description:
      'Структурований підхід до підготовки — алгоритми, системний дизайн, behavioral, live coding. Розклад підготовки на 8 тижнів, топ ресурси, типові помилки та як вести переговори про зарплату.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 6234,
    tags: ["Кар'єра", 'Продуктивність'],
    authorIdx: 4,
    daysAgo: 21,
    imageUrl:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
  },
  {
    title: 'GraphQL vs REST у 2026: коли що обирати',
    description:
      'Порівняння підходів до API дизайну з точки зору продуктивності, кешування, інструментарію та досвіду розробників. Hybrid підхід з tRPC. Коли GraphQL виграє і коли REST простіший та надійніший.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1987,
    tags: ['TypeScript', 'Node.js', 'NestJS'],
    authorIdx: 2,
    daysAgo: 22,
    imageUrl: null,
  },
  {
    title: 'Tailwind CSS 4: нове покоління утилітарного CSS',
    description:
      'Що нового у Tailwind CSS 4 — Oxide engine, CSS-first конфігурація, нові утиліти, покращення продуктивності. Порівняння з CSS-in-JS рішеннями та практичні поради для міграції з третьої версії.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 2654,
    tags: ['UI/UX', 'React', 'JavaScript'],
    authorIdx: 7,
    daysAgo: 23,
    imageUrl:
      'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=400&h=400&fit=crop',
  },
  {
    title: 'Моніторинг Node.js додатків: від логів до трейсів',
    description:
      'Повний стек observability для Node.js — структуровані логи з Pino, метрики з Prometheus, трейсинг з OpenTelemetry, Grafana дашборди. Як знаходити bottlenecks та memory leaks в продакшені.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1234,
    tags: ['Node.js', 'DevOps', 'NestJS'],
    authorIdx: 6,
    daysAgo: 24,
    imageUrl: null,
  },
  {
    title: 'Софт-скіли для сеньйор-розробника: що крім коду',
    description:
      "Менторинг, код-рев'ю як навчання, технічне лідерство, комунікація з бізнесом, документація архітектурних рішень (ADR). Як рости від senior до staff engineer та навіщо це потрібно.",
    status: PublicationStatus.PUBLISHED,
    viewCount: 3789,
    tags: ["Кар'єра", 'Продуктивність'],
    authorIdx: 3,
    daysAgo: 25,
    imageUrl: null,
  },
  // На модерації
  {
    title: 'Machine Learning з JavaScript: TensorFlow.js на практиці',
    description:
      'Створюємо ML моделі прямо в браузері з TensorFlow.js. Класифікація зображень, розпізнавання мови, генерація тексту — все без Python. Transfer learning, Web Workers та оптимізація для мобільних пристроїв.',
    status: PublicationStatus.PENDING,
    viewCount: 0,
    tags: ['Machine Learning', 'JavaScript', 'AI'],
    authorIdx: 1,
    daysAgo: 0,
    imageUrl:
      'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=400&fit=crop',
  },
  {
    title: 'Архітектура мікросервісів: уроки з 3 років у продакшені',
    description:
      'Чесна розповідь про перехід з моноліту на мікросервіси. Event-driven архітектура, saga pattern, service mesh, distributed tracing. Помилки які ми зробили та скільки це коштувало.',
    status: PublicationStatus.PENDING,
    viewCount: 0,
    tags: ['DevOps', 'Node.js', 'Docker'],
    authorIdx: 4,
    daysAgo: 0,
    imageUrl: null,
  },
  {
    title: 'Vue 4: що змінилось та навіщо мігрувати',
    description:
      'Огляд Vue 4 — Vapor mode, покращена реактивність, нові composables, TypeScript-first підхід. Покрокова міграція з Vue 3 та порівняння з React 19.',
    status: PublicationStatus.PENDING,
    viewCount: 0,
    tags: ['JavaScript', 'TypeScript'],
    authorIdx: 5,
    daysAgo: 1,
    imageUrl: null,
  },
  {
    title: 'Edge Computing: розгортання додатків на межі мережі',
    description:
      'Cloudflare Workers, Vercel Edge Functions, Deno Deploy — порівняння платформ для edge computing. Коли це справді потрібно і як це впливає на latency та вартість інфраструктури.',
    status: PublicationStatus.PENDING,
    viewCount: 0,
    tags: ['DevOps', 'JavaScript', 'TypeScript'],
    authorIdx: 6,
    daysAgo: 0,
    imageUrl: null,
  },
  {
    title: 'Як будувати API, яке не зламається: версіонування та контракти',
    description:
      'API versioning, OpenAPI spec, contract testing з Pact, backward compatibility. Як підтримувати десятки клієнтів та не зламати нікого при кожному релізі. Практичні приклади з NestJS.',
    status: PublicationStatus.PENDING,
    viewCount: 0,
    tags: ['NestJS', 'TypeScript', 'Node.js'],
    authorIdx: 2,
    daysAgo: 0,
    imageUrl: null,
  },
  // Відхилені
  {
    title: 'Топ-10 VS Code розширень для 2026 року',
    description:
      "Мій суб'єктивний список найкращих розширень для VS Code, які підвищують продуктивність. Від AI copilot до тем оформлення — все що потрібно фулстек-розробнику.",
    status: PublicationStatus.REJECTED,
    viewCount: 0,
    tags: ['Продуктивність'],
    authorIdx: 3,
    daysAgo: 5,
    imageUrl: null,
  },
  {
    title: 'Тестовий пост для перевірки',
    description:
      'Це тестовий пост, який був створений для перевірки функціоналу системи модерації публікацій на платформі SkillShare.',
    status: PublicationStatus.REJECTED,
    viewCount: 0,
    tags: [],
    authorIdx: 7,
    daysAgo: 10,
    imageUrl: null,
  },
  // Ще опубліковані
  {
    title: "Зворотній зв'язок в коді: культура код-рев'ю",
    description:
      "Як давати та приймати фідбек на код-рев'ю без конфліктів. Конструктивна критика, автоматизація рутини з linters та formatters, checklist для рев'юера. Створюємо культуру навчання в команді.",
    status: PublicationStatus.PUBLISHED,
    viewCount: 2345,
    tags: ["Кар'єра", 'Продуктивність'],
    authorIdx: 4,
    daysAgo: 26,
    imageUrl: null,
  },
  {
    title: 'PWA у 2026: чи потрібні ще нативні додатки?',
    description:
      'Progressive Web Apps досягли нового рівня — push notifications на iOS, file system access, background sync. Порівняння з нативними додатками за швидкістю, UX та вартістю розробки.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1678,
    tags: ['Mobile', 'JavaScript', 'React'],
    authorIdx: 1,
    daysAgo: 27,
    imageUrl:
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=400&fit=crop',
  },
  {
    title: 'Astro 5: статичні сайти на стероїдах',
    description:
      'Огляд Astro 5 — island architecture, server actions, content collections, view transitions. Ідеально для блогів, документації та маркетингових сторінок. Порівняння з Next.js та Nuxt.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 876,
    tags: ['JavaScript', 'TypeScript'],
    authorIdx: 7,
    daysAgo: 28,
    imageUrl: null,
  },
  {
    title: 'Redis: більше ніж кеш — 7 патернів використання',
    description:
      'Redis як брокер повідомлень, rate limiter, session store, real-time analytics, leaderboard, distributed lock, геопросторовий індекс. Приклади з Node.js та benchmarks для кожного кейсу.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1543,
    tags: ['Node.js', 'DevOps', 'NestJS'],
    authorIdx: 6,
    daysAgo: 29,
    imageUrl: null,
  },
  {
    title: 'Figma для розробників: ефективна колаборація',
    description:
      'Як розробнику ефективно працювати з Figma — Dev Mode, inspect, auto layout, components, design tokens. Мінімізуємо gap між дизайном і кодом та прискорюємо верстку у 2 рази.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 2098,
    tags: ['UI/UX', 'Дизайн'],
    authorIdx: 5,
    daysAgo: 30,
    imageUrl:
      'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&h=400&fit=crop',
  },
  {
    title: 'CI/CD з GitHub Actions: автоматизуємо все',
    description:
      'Побудова повного CI/CD пайплайну з GitHub Actions — тести, лінтери, білд, деплой на staging та production. Матричні білди, кеш залежностей, секрети, самописні actions та reusable workflows.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 1765,
    tags: ['DevOps', 'Docker'],
    authorIdx: 4,
    daysAgo: 31,
    imageUrl: null,
  },
  {
    title: 'Ефективне навчання програмуванню: метод Feynman',
    description:
      'Як техніка Фейнмана допомагає вивчати складні технічні концепції. Пояснюємо рекурсію, алгоритми, патерни проєктування так, щоб зрозуміла навіть бабуся. Мій досвід менторства 50+ джунів.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 4321,
    tags: ["Кар'єра", 'Продуктивність'],
    authorIdx: 3,
    daysAgo: 32,
    imageUrl: null,
  },
  {
    title: 'Bun vs Node.js vs Deno: великий бенчмарк 2026',
    description:
      'Незалежне порівняння трьох JavaScript рантаймів за 15 параметрами. HTTP throughput, file I/O, startup time, memory usage, TypeScript підтримка, npm сумісність. Тести на реальних додатках.',
    status: PublicationStatus.PUBLISHED,
    viewCount: 3567,
    tags: ['Node.js', 'JavaScript', 'TypeScript'],
    authorIdx: 2,
    daysAgo: 33,
    imageUrl:
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=400&fit=crop',
  },
];

async function main() {
  console.log('🌱 Починаю заповнення бази тестовими даними...\n');

  // Очистка в правильному порядку
  await prisma.savedPublication.deleteMany();
  await prisma.publicationTag.deleteMany();
  await prisma.publication.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑️  Базу очищено');

  // Створення тегів
  const tagRecords: Record<string, string> = {};
  for (const name of TAGS) {
    const tag = await prisma.tag.create({ data: { name } });
    tagRecords[name] = tag.id;
  }
  console.log(`🏷️  Створено ${TAGS.length} тегів`);

  // Створення користувачів
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const userRecords: string[] = [];
  for (const u of USERS) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        password: hashedPassword,
        role: u.role,
      },
    });
    userRecords.push(user.id);
  }
  console.log(
    `👤 Створено ${USERS.length} користувачів (пароль: Password123!)`,
  );

  // Створення публікацій
  const publicationIds: string[] = [];
  for (const pub of PUBLICATIONS) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - pub.daysAgo);
    createdAt.setHours(
      Math.floor(Math.random() * 14) + 8,
      Math.floor(Math.random() * 60),
    );

    const publication = await prisma.publication.create({
      data: {
        title: pub.title,
        description: pub.description,
        status: pub.status,
        viewCount: pub.viewCount,
        imageUrl: pub.imageUrl,
        authorId: userRecords[pub.authorIdx],
        createdAt,
        tags: {
          create: pub.tags
            .filter((t) => tagRecords[t])
            .map((t) => ({ tagId: tagRecords[t] })),
        },
      },
    });
    publicationIds.push(publication.id);
  }
  console.log(`📝 Створено ${PUBLICATIONS.length} публікацій`);

  // Збережені публікації (тільки опубліковані)
  const publishedIds = publicationIds.filter(
    (_, i) => PUBLICATIONS[i].status === PublicationStatus.PUBLISHED,
  );
  let savedCount = 0;
  for (let uIdx = 1; uIdx < userRecords.length; uIdx++) {
    const howMany = 3 + Math.floor(Math.random() * 6);
    const shuffled = [...publishedIds].sort(() => Math.random() - 0.5);
    const toSave = shuffled.slice(0, howMany);

    for (const pubId of toSave) {
      const pubAuthorIdx =
        PUBLICATIONS[publicationIds.indexOf(pubId)]?.authorIdx;
      if (pubAuthorIdx === uIdx) continue;

      await prisma.savedPublication.create({
        data: {
          userId: userRecords[uIdx],
          publicationId: pubId,
        },
      });
      savedCount++;
    }
  }
  console.log(`⭐ Створено ${savedCount} збережених публікацій`);

  console.log('\n✅ Seed завершено успішно!');
  console.log('\n📋 Облікові записи для входу:');
  console.log('   Пароль для всіх: Password123!\n');
  for (const u of USERS) {
    console.log(`   ${u.role === Role.ADMIN ? '👑' : '👤'} ${u.email}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Помилка seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
