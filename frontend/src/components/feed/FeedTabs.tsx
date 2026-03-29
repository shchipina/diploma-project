import { cn } from '@/lib/utils';

interface FeedTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'for-you', label: 'Для вас' },
  { id: 'popular', label: 'Популярне' },
  { id: 'saved', label: 'Збережене' },
];

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="border-b border-slate-200">
      <div className="flex gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative px-4 py-3 text-sm font-medium transition-colors',
              activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600',
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 h-[1px] w-full bg-slate-900" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
