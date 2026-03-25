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
import { useRegister } from '@/hooks/useAuth';

const formSchema = z
  .object({
    email: z.string().email({
      message: 'Введіть коректну email адресу.',
    }),
    password: z.string().min(8, {
      message: 'Пароль має містити мінімум 8 символів.',
    }),
    confirmPassword: z.string().min(8, {
      message: 'Пароль має містити мінімум 8 символів.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Паролі не збігаються.',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof formSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const registerMutation = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  function onSubmit(values: RegisterFormValues) {
    registerMutation.mutate(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      {registerMutation.isError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
          {registerMutation.error instanceof Error &&
          'response' in registerMutation.error &&
          typeof registerMutation.error.response === 'object' &&
          registerMutation.error.response &&
          'data' in registerMutation.error.response &&
          typeof registerMutation.error.response.data === 'object' &&
          registerMutation.error.response.data &&
          'message' in registerMutation.error.response.data
            ? String(registerMutation.error.response.data.message)
            : 'Помилка реєстрації. Спробуйте ще раз.'}
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
                    disabled={registerMutation.isPending}
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
                <FormLabel className="text-sm font-medium text-slate-700">Пароль</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    disabled={registerMutation.isPending}
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
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">
                  Підтвердіть пароль
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    disabled={registerMutation.isPending}
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
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Реєстрація...' : 'Зареєструватися'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
