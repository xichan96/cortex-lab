import React from 'react';
import { NavLink } from 'react-router';
import { MessageSquare, Users, Settings, User, Sun, Moon, X, BookOpen, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useThemeStore } from '@/store';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/store/auth';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useI18n();
  const { logout } = useAuthStore();
  const navItems = [
    { to: '/chat', icon: MessageSquare, label: t('nav.chat', 'Chat') },
    { to: '/role', icon: Users, label: t('nav.roles', 'Roles') },
  ];

  return (
    <aside className="w-20 sm:w-20 md:w-16 lg:w-20 flex flex-col items-center py-3 sm:py-4 border-r bg-[var(--sider-bg)] border-[var(--sider-border-right)] h-full">
      <div className="mb-6 sm:mb-8 flex items-center justify-between w-full px-2 sm:px-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg">
          C
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 sm:p-1.5 rounded text-[var(--text-color-secondary)] hover:bg-[var(--item-hover-bg)] hover:text-[var(--text-color)] transition-colors"
          >
            <X size={20} className="sm:w-5 sm:h-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 flex flex-col gap-2 sm:gap-3 lg:gap-4 w-full px-2 sm:px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl transition-all duration-200 gap-1',
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg scale-105'
                  : 'text-[var(--text-color-secondary)] hover:bg-[var(--item-hover-bg)] hover:text-[var(--text-color)] hover:scale-105'
              )
            }
          >
            <item.icon size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 mt-auto w-full px-2 sm:px-3">
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl text-[var(--text-color-secondary)] hover:bg-[var(--item-hover-bg)] hover:text-[var(--text-color)] hover:scale-105 transition-all duration-200"
          title={theme === 'light' ? t('theme.switch.dark', 'Switch to Dark Mode') : t('theme.switch.light', 'Switch to Light Mode')}
        >
          {theme === 'light' ? <Moon size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> : <Sun size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
        </button>

        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl transition-all duration-200',
              isActive
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'text-[var(--text-color-secondary)] hover:bg-[var(--item-hover-bg)] hover:text-[var(--text-color)] hover:scale-105'
            )
          }
        >
          <Settings size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </NavLink>
        <NavLink
          to="/users"
          onClick={onClose}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl transition-all duration-200',
              isActive
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'text-[var(--text-color-secondary)] hover:bg-[var(--item-hover-bg)] hover:text-[var(--text-color)] hover:scale-105'
            )
          }
        >
          <User size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </NavLink>
        <button
          onClick={() => logout()}
          className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl text-[var(--text-color-secondary)] hover:bg-[var(--item-hover-bg)] hover:text-[var(--text-color)] hover:scale-105 transition-all duration-200"
        >
          <LogOut size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </button>
      </div>
    </aside>
  );
}
