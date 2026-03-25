import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Ласкаво просимо!</CardTitle>
            <CardDescription>
              Будь ласка, увійдіть або зареєструйтесь для продовження
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Перейти до авторизації
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Платформа обміну навичками</CardTitle>
          <CardDescription>Вітаємо в системі!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-slate-100 p-4">
            <h3 className="mb-2 font-semibold">Інформація про користувача</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">ID:</span> {user.id}
              </p>
              <p>
                <span className="font-medium">Роль:</span>{' '}
                <span className="rounded bg-primary/10 px-2 py-0.5 text-primary">{user.role}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? 'Вихід...' : 'Вийти'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
