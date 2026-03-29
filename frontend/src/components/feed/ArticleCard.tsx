import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { useToggleSave } from '@/hooks/usePublications';
import type { Publication } from '@/services/publications.service';

interface ArticleCardProps {
  article: Publication;
  isSaved?: boolean;
}

export function ArticleCard({ article, isSaved = false }: ArticleCardProps) {
  const navigate = useNavigate();
  const toggleSave = useToggleSave();
  const initials = article.author.email.charAt(0).toUpperCase();

  const date = new Date(article.createdAt).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
  });

  const readTime = `${Math.max(1, Math.ceil(article.description.length / 1000))} хв читання`;

  const handleOpen = () => navigate(`/publications/${article.id}`);

  return (
    <article className="group border-b border-slate-100 py-6 last:border-b-0">
      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
              {initials}
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-medium text-slate-900">{article.author.email}</span>
            </div>
          </div>

          <button onClick={handleOpen} className="block w-full text-left">
            <h2 className="mb-1 line-clamp-2 text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-violet-600">
              {article.title}
            </h2>
            <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
              {article.description}
            </p>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{date}</span>
              <span>&middot;</span>
              <span>{readTime}</span>
              {article.tags?.map((t) => (
                <span
                  key={t.tagId}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                >
                  {t.tag.name}
                </span>
              ))}
            </div>
            <button
              onClick={() => toggleSave.mutate(article.id)}
              className={`rounded-full p-1.5 transition-colors ${
                isSaved
                  ? 'text-violet-500 hover:text-violet-700'
                  : 'text-slate-300 hover:text-slate-600'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {article.imageUrl && (
          <div className="hidden flex-shrink-0 cursor-pointer sm:block" onClick={handleOpen}>
            <img
              src={article.imageUrl}
              alt=""
              className="h-28 w-28 rounded-md object-cover transition-opacity group-hover:opacity-90 sm:h-32 sm:w-32"
            />
          </div>
        )}
      </div>
    </article>
  );
}
