import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import {
  useModerationPublications,
  useModerationStats,
  useApprovePublication,
  useRejectPublication,
} from '@/hooks/useModeration';
import {
  Shield,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STATUS_TABS = [
  { key: 'PENDING', label: 'На модерації', icon: Clock, color: 'amber' },
  { key: 'PUBLISHED', label: 'Опубліковано', icon: CheckCircle, color: 'emerald' },
  { key: 'REJECTED', label: 'Відхилено', icon: XCircle, color: 'red' },
  { key: 'ALL', label: 'Всі', icon: FileText, color: 'slate' },
] as const;

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  PENDING: {
    label: 'На модерації',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  PUBLISHED: {
    label: 'Опубліковано',
    icon: CheckCircle,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  REJECTED: {
    label: 'Відхилено',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

export function ModerationPage() {
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: stats } = useModerationStats();
  const { data, isLoading } = useModerationPublications({
    page,
    limit: 20,
    status: statusFilter,
  });

  const approveMutation = useApprovePublication();
  const rejectMutation = useRejectPublication();

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const statValues: Record<string, number> = {
    PENDING: stats?.pending ?? 0,
    PUBLISHED: stats?.published ?? 0,
    REJECTED: stats?.rejected ?? 0,
    ALL: stats?.total ?? 0,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="mx-auto max-w-[1100px] px-6 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Модерація публікацій</h1>
            <p className="text-sm text-slate-500">Переглядайте та керуйте статусом публікацій</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATUS_TABS.map(({ key, label, icon: Icon, color }) => {
            const isActive = statusFilter === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setStatusFilter(key);
                  setPage(1);
                }}
                className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                  isActive
                    ? 'border-violet-300 bg-white shadow-sm ring-1 ring-violet-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isActive ? 'bg-violet-100' : `bg-${color}-50`
                  }`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 ${isActive ? 'text-violet-600' : `text-${color}-500`}`}
                  />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-slate-900">{statValues[key]}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-slate-900">Публікацій немає</h3>
            <p className="text-sm text-slate-500">
              {statusFilter === 'PENDING'
                ? 'Немає публікацій, що очікують модерації'
                : 'Немає публікацій з таким статусом'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((pub) => {
              const status = STATUS_CONFIG[pub.status];
              const StatusIcon = status.icon;
              const isExpanded = expandedId === pub.id;
              const isPending = pub.status === 'PENDING';
              const date = new Date(pub.createdAt).toLocaleDateString('uk-UA', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={pub.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start gap-4 p-5">
                    {pub.imageUrl && (
                      <img
                        src={pub.imageUrl}
                        alt=""
                        className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-start justify-between gap-3">
                        <h3 className="line-clamp-1 text-base font-bold text-slate-900">
                          {pub.title}
                        </h3>
                        <div
                          className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </div>
                      </div>

                      <p
                        className={`mb-2 text-sm text-slate-500 ${isExpanded ? '' : 'line-clamp-2'}`}
                      >
                        {pub.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="font-medium text-slate-600">{pub.author.email}</span>
                        <span>&middot;</span>
                        <span>{date}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {pub.viewCount}
                        </div>
                        {pub.tags.length > 0 && (
                          <div className="flex gap-1">
                            {pub.tags.map((t) => (
                              <span
                                key={t.tagId}
                                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
                              >
                                {t.tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : pub.id)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          Згорнути
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          Детальніше
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      {(isPending || pub.status === 'REJECTED') && (
                        <button
                          onClick={() => approveMutation.mutate(pub.id)}
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Схвалити
                        </button>
                      )}
                      {(isPending || pub.status === 'PUBLISHED') && (
                        <button
                          onClick={() => rejectMutation.mutate(pub.id)}
                          disabled={rejectMutation.isPending}
                          className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Відхилити
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-white disabled:opacity-40"
            >
              Назад
            </button>
            <span className="text-sm text-slate-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-white disabled:opacity-40"
            >
              Далі
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
