import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Lightbulb, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: BookOpen,
    title: 'Діліться знаннями',
    description: 'Публікуйте статті, дослідження та практичні гайди для спільноти.',
  },
  {
    icon: Users,
    title: 'Знаходьте однодумців',
    description: 'Підписуйтесь на авторів та слідкуйте за цікавими темами.',
  },
  {
    icon: Lightbulb,
    title: 'Розвивайте навички',
    description: 'Навчайтесь нового щодня завдяки персоналізованій стрічці.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SkillShare</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Увійти
            </Button>
            <Button onClick={() => navigate('/auth')}>Почати безкоштовно</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden pt-32 pb-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-100/60 blur-[120px]" />
            <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-100/50 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700">
                <Sparkles className="h-3.5 w-3.5" />
                Платформа обміну знаннями
              </div>
              <h1 className="mb-6 text-5xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-tight">
                Місце, де знання
                <br />
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  стають силою
                </span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-500">
                Читайте та публікуйте статті, досліджуйте нові теми, діліться досвідом зі спільнотою
                професіоналів. Ваші знання мають значення.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 px-8">
                  Розпочати
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                  Дізнатися більше
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-t border-slate-100 bg-slate-50/50 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-3xl font-bold text-slate-900">Чому SkillShare?</h2>
              <p className="text-slate-500">
                Все необхідне для ефективного обміну знаннями в одному місці.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
                    <feature.icon className="h-6 w-6 text-violet-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-12 text-center sm:p-16"
            >
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Готові розпочати?</h2>
              <p className="mx-auto mb-8 max-w-lg text-slate-300">
                Приєднуйтесь до тисяч людей, які щодня вчаться новому та діляться досвідом.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="gap-2 bg-white px-8 text-slate-900 hover:bg-slate-100"
              >
                Створити акаунт
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} SkillShare. Усі права захищені.
        </div>
      </footer>
    </div>
  );
}
