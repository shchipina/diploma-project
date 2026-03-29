import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { ArticleCard } from '@/components/feed/ArticleCard';
import { Sidebar } from '@/components/feed/Sidebar';
import { FeedTabs } from '@/components/feed/FeedTabs';
import { useQuery } from '@tanstack/react-query';
import { publicationsApi, type QueryParams } from '@/services/publications.service';
import { publicationKeys, useSavedIds } from '@/hooks/usePublications';
import { Loader2, X } from 'lucide-react';

type TabId = 'for-you' | 'popular' | 'saved';

const tabFetchers: Record<
  TabId,
  (params: QueryParams) => ReturnType<typeof publicationsApi.getFeed>
> = {
  'for-you': publicationsApi.getForYou,
  popular: publicationsApi.getPopular,
  saved: publicationsApi.getSaved,
};

const tabKeys: Record<TabId, (params?: QueryParams) => readonly unknown[]> = {
  'for-you': publicationKeys.forYou,
  popular: publicationKeys.popular,
  saved: publicationKeys.saved,
};

export function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>('popular');
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const params: QueryParams = {
    page,
    limit: 20,
    ...(selectedTag && { tag: selectedTag }),
  };

  const { data, isLoading } = useQuery({
    queryKey: tabKeys[activeTab](params),
    queryFn: () => tabFetchers[activeTab](params),
  });

  const { data: savedIds } = useSavedIds();
  const savedSet = new Set(savedIds ?? []);

  const articles = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabId);
    setPage(1);
  };

  const handleTagClick = (tag: string | null) => {
    setSelectedTag(tag);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto flex max-w-[1336px] px-6 pt-6">
        <main className="min-w-0 flex-1 pr-0 lg:pr-10">
          <FeedTabs activeTab={activeTab} onTabChange={handleTabChange} />

          {selectedTag && (
            <div className="flex items-center gap-2 border-b border-slate-100 py-3">
              <span className="text-sm text-slate-500">Фільтр:</span>
              <button
                onClick={() => setSelectedTag(null)}
                className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100"
              >
                {selectedTag}
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
          ) : articles.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-slate-500">
                {selectedTag
                  ? `Публікацій з тегом «${selectedTag}» не знайдено`
                  : activeTab === 'for-you'
                    ? 'Збережіть публікації, щоб отримувати персональні рекомендації'
                    : activeTab === 'saved'
                      ? 'У вас поки немає збережених публікацій'
                      : 'Публікацій поки немає'}
              </p>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="mt-3 text-sm font-medium text-violet-500 hover:text-violet-700"
                >
                  Скинути фільтр
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    isSaved={savedSet.has(article.id)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 border-t border-slate-100 py-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    Назад
                  </button>
                  <span className="text-sm text-slate-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    Далі
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <div className="hidden lg:block">
          <Sidebar activeTag={selectedTag} onTagClick={handleTagClick} />
        </div>
      </div>
    </div>
  );
}
