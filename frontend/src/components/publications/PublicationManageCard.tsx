import { useState } from 'react';
import { Edit3, Trash2, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useDeletePublication } from '@/hooks/usePublications';
import { EditPublicationModal } from './EditPublicationModal';
import type { Publication } from '@/services/publications.service';

interface PublicationManageCardProps {
  publication: Publication;
}

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

export function PublicationManageCard({ publication }: PublicationManageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteMutation = useDeletePublication();

  const status = STATUS_CONFIG[publication.status];
  const StatusIcon = status.icon;
  const date = new Date(publication.createdAt).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
        <div className="flex gap-4">
          {publication.imageUrl && (
            <img
              src={publication.imageUrl}
              alt=""
              className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-start justify-between gap-3">
              <h3 className="line-clamp-1 text-base font-bold text-slate-900">
                {publication.title}
              </h3>
              <div
                className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </div>
            </div>

            <p className="mb-3 line-clamp-2 text-sm text-slate-500">{publication.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{date}</span>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Eye className="h-3.5 w-3.5" />
                  {publication.viewCount}
                </div>
                {publication.tags.length > 0 && (
                  <div className="flex gap-1">
                    {publication.tags.map((t) => (
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

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  title="Редагувати"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Видалити"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">Видалити цю публікацію?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg px-3 py-1 text-sm text-slate-600 hover:bg-white"
              >
                Скасувати
              </button>
              <button
                onClick={() => deleteMutation.mutate(publication.id)}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                Видалити
              </button>
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <EditPublicationModal publication={publication} onClose={() => setIsEditing(false)} />
      )}
    </>
  );
}
