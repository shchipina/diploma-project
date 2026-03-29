import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  PenSquare,
  Bell,
  Sparkles,
  LogOut,
  User,
  ChevronDown,
  FileText,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useAuth';

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.email?.charAt(0).toUpperCase() ?? 'U';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-[1336px] items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SkillShare</span>
          </button>

          <div className="relative ml-2 hidden sm:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Пошук..."
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              className={`h-9 rounded-full bg-slate-100 py-2 pr-4 pl-9 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300 ${searchOpen ? 'w-64' : 'w-52'}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/my-publications')}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            <PenSquare className="h-5 w-5" />
            <span className="hidden sm:inline">Написати</span>
          </button>

          <button className="relative rounded-full p-2 text-slate-400 transition-colors hover:text-slate-700">
            <Bell className="h-5 w-5" />
          </button>

          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 rounded-full p-1 transition-colors hover:bg-slate-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-semibold text-white">
                {initials}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-medium text-slate-900">{user?.email}</p>
                  <p className="text-xs text-slate-400">
                    {user?.role === 'ADMIN' ? 'Адміністратор' : 'Користувач'}
                  </p>
                </div>
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/admin/moderation');
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-violet-600 transition-colors hover:bg-violet-50"
                  >
                    <Shield className="h-4 w-4" />
                    Модерація
                  </button>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/my-publications');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <FileText className="h-4 w-4" />
                  Мої публікації
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <User className="h-4 w-4" />
                  Профіль
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logoutMutation.mutate();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Вийти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
