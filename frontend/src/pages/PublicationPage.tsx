import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { publicationsApi } from '@/services/publications.service';
import { publicationKeys, useToggleSave } from '@/hooks/usePublications';
import { ArrowLeft, Bookmark, Eye, Calendar, Clock, Loader2 } from 'lucide-react';

export function PublicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toggleSave = useToggleSave();

  const {
    data: publication,
    isLoading,
    isError,
  } = useQuery({
    queryKey: publicationKeys.one(id!),
    queryFn: () => publicationsApi.getOne(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      </div>
    );
  }

  if (isError || !publication) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-[720px] px-6 py-16 text-center">
          <h1 className="mb-2 text-2xl font-bold text-slate-900">Публікацію не знайдено</h1>
          <p className="mb-6 text-slate-500">
            Можливо, вона була видалена або ще не пройшла модерацію.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
          >
            <ArrowLeft className="h-4 w-4" />
            На головну
          </button>
        </div>
      </div>
    );
  }

  const initials = publication.author.email.charAt(0).toUpperCase();
  const createdDate = new Date(publication.createdAt).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const readTime = `${Math.max(1, Math.ceil(publication.description.length / 1000))} хв читання`;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <article className="mx-auto max-w-[720px] px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>

        <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {publication.title}
        </h1>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-semibold text-white">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{publication.author.email}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {createdDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between border-y border-slate-100 py-3">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {publication.viewCount} переглядів
            </span>
            <span className="flex items-center gap-1.5">
              <Bookmark className="h-4 w-4" />
              {publication._count?.savedBy ?? 0} збережень
            </span>
          </div>
          <button
            onClick={() => toggleSave.mutate(publication.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              publication.isSaved
                ? 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${publication.isSaved ? 'fill-current' : ''}`} />
            {publication.isSaved ? 'Збережено' : 'Зберегти'}
          </button>
        </div>

        {publication.imageUrl && (
          <div className="mb-8 overflow-hidden rounded-xl">
            <img
              src={publication.imageUrl}
              alt={publication.title}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        <div className="prose-slate prose max-w-none">
          {publication.description.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4 text-base leading-relaxed text-slate-700">
              {paragraph}
            </p>
          ))}
        </div>

        {publication.tags.length > 0 && (
          <div className="mt-10 border-t border-slate-100 pt-6">
            <div className="flex flex-wrap gap-2">
              {publication.tags.map((t) => (
                <span
                  key={t.tagId}
                  className="rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-medium text-slate-600"
                >
                  {t.tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
