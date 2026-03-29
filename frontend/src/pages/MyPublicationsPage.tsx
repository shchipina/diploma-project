import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CreatePublicationModal } from '@/components/publications/CreatePublicationModal';
import { PublicationManageCard } from '@/components/publications/PublicationManageCard';
import { useMyPublications } from '@/hooks/usePublications';
import { Plus, FileText, Loader2 } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ALL: { label: 'Всі', color: '' },
  PENDING: { label: 'На модерації', color: 'bg-amber-100 text-amber-700' },
  PUBLISHED: { label: 'Опубліковано', color: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'Відхилено', color: 'bg-red-100 text-red-700' },
};

export function MyPublicationsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyPublications({ page, limit: 20 });

  const filtered =
    statusFilter === 'ALL' ? data?.items : data?.items?.filter((p) => p.status === statusFilter);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-[900px] px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Мої публікації</h1>
            <p className="mt-1 text-sm text-slate-500">
              Управляйте своїми публікаціями, відстежуйте статус модерації
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-violet-600 hover:to-indigo-700 hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Нова публікація
          </button>
        </div>

        <div className="mb-6 flex gap-2">
          {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(key);
                setPage(1);
              }}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          </div>
        ) : !filtered?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-slate-900">Публікацій немає</h3>
            <p className="mb-4 text-sm text-slate-500">
              Створіть свою першу публікацію, щоб поділитися знаннями
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
            >
              <Plus className="h-4 w-4" />
              Створити публікацію
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((publication) => (
              <PublicationManageCard key={publication.id} publication={publication} />
            ))}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              Назад
            </button>
            <span className="text-sm text-slate-500">
              {page} / {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              Далі
            </button>
          </div>
        )}
      </div>

      {isCreateOpen && <CreatePublicationModal onClose={() => setIsCreateOpen(false)} />}
    </div>
  );
}
