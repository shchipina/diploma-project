import { useTags } from '@/hooks/usePublications';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTag?: string | null;
  onTagClick?: (tag: string | null) => void;
}

export function Sidebar({ activeTag, onTagClick }: SidebarProps) {
  const { data: tags } = useTags();

  const handleClick = (tagName: string) => {
    onTagClick?.(activeTag === tagName ? null : tagName);
  };

  return (
    <aside className="w-80 flex-shrink-0 pl-10">
      <div className="sticky top-20">
        <section>
          <h3 className="mb-4 text-sm font-bold tracking-wide text-slate-900">
            Рекомендовані теми
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags && tags.length > 0 ? (
              tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleClick(tag.name)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                    activeTag === tag.name
                      ? 'border-violet-300 bg-violet-50 font-medium text-violet-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100',
                  )}
                >
                  {tag.name}
                  {tag._count.publications > 0 && (
                    <span
                      className={cn(
                        'ml-1.5 text-xs',
                        activeTag === tag.name ? 'text-violet-400' : 'text-slate-400',
                      )}
                    >
                      {tag._count.publications}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-400">Теги з'являться після створення публікацій</p>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}
