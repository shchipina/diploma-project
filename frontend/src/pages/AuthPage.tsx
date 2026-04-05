import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { useAuthStore } from '@/store/auth.store';

function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>('login');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } },
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden w-full overflow-hidden bg-slate-950 lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-violet-600/30 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]"
        />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex items-center gap-2 text-2xl font-bold text-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
            ✨
          </div>
          SkillShare
        </motion.div>

        <div className="relative z-10 my-auto max-w-lg">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 text-5xl font-extrabold leading-tight text-white"
          >
            Розкрийте свій <br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              потенціал
            </span>{' '}
            разом з нами
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-10 text-lg text-slate-300"
          >
            Приєднуйтесь до найбільшої спільноти, де тисячі людей щодня обмінюються знаннями,
            вчаться новому та знаходять однодумців.
          </motion.p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-3"
          >
            {[
              '💻 Програмування',
              '🎨 UI/UX Дизайн',
              '📈 Маркетинг',
              '🎸 Музика',
              '🇬🇧 Англійська',
            ].map((skill) => (
              <motion.div
                key={skill}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -2 }}
                className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10"
              >
                {skill}
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative z-10 grid grid-cols-3 gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg"
        >
          {[
            { value: '10k+', label: 'Користувачів' },
            { value: '500+', label: 'Навичок' },
            { value: '98%', label: 'Задоволених' },
          ].map((stat, index) => (
            <div key={index}>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900">
              {activeTab === 'login' ? 'З поверненням!' : 'Створити акаунт'}
            </h1>
            <p className="text-slate-500">
              {activeTab === 'login'
                ? 'Введіть свої дані, щоб увійти в систему'
                : 'Почніть свій шлях до нових знань вже сьогодні'}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
              <TabsTrigger
                value="login"
                className="rounded-lg py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:shadow-sm"
              >
                Вхід
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-lg py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:shadow-sm"
              >
                Реєстрація
              </TabsTrigger>
            </TabsList>

            <div className="min-h-[300px]">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="login" className="m-0 border-none p-0 outline-none">
                  <LoginForm />
                </TabsContent>

                <TabsContent value="register" className="m-0 border-none p-0 outline-none">
                  <RegisterForm onSuccess={() => setActiveTab('login')} />
                </TabsContent>
              </motion.div>
            </div>
          </Tabs>

          <div className="text-center text-xs text-slate-500">
            Продовжуючи, ви погоджуєтесь з нашими{' '}
            <a
              href="#"
              className="font-semibold text-slate-900 transition-colors hover:text-violet-600 hover:underline"
            >
              Умовами використання
            </a>{' '}
            та{' '}
            <a
              href="#"
              className="font-semibold text-slate-900 transition-colors hover:text-violet-600 hover:underline"
            >
              Політикою конфіденційності
            </a>
            .
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthPage;
