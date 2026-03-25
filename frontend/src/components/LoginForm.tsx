import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useLogin } from '@/hooks/useAuth';

const formSchema = z.object({
  email: z.string().email({
    message: 'Введіть коректну email адресу.',
  }),
  password: z.string().min(8, {
    message: 'Пароль має містити мінімум 8 символів.',
  }),
});

type LoginFormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  }

  return (
    <div className="space-y-6">
      {loginMutation.isError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
          {loginMutation.error instanceof Error &&
          'response' in loginMutation.error &&
          typeof loginMutation.error.response === 'object' &&
          loginMutation.error.response &&
          'data' in loginMutation.error.response &&
          typeof loginMutation.error.response.data === 'object' &&
          loginMutation.error.response.data &&
          'message' in loginMutation.error.response.data
            ? String(loginMutation.error.response.data.message)
            : 'Помилка входу. Перевірте дані та спробуйте ще раз.'}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="mail@example.com"
                    type="email"
                    disabled={loginMutation.isPending}
                    className="h-12 border-slate-300 bg-slate-50 text-base focus:border-blue-500 focus:bg-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium text-slate-700">Пароль</FormLabel>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    Забули пароль?
                  </a>
                </div>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    disabled={loginMutation.isPending}
                    className="h-12 border-slate-300 bg-slate-50 text-base focus:border-blue-500 focus:bg-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="h-12 w-full bg-blue-600 text-base font-medium hover:bg-blue-700"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Вхід...' : 'Увійти'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
