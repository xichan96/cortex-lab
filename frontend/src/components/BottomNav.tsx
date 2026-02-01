import React from 'react';
import { NavLink } from 'react-router';
import { MessageSquare, Users as UsersIcon, Settings, User } from 'lucide-react';
import clsx from 'clsx';
import { useI18n } from '@/hooks/useI18n';

export function BottomNav() {
  const { t } = useI18n();
  
  const navItems = [
    { to: '/chat', icon: MessageSquare, label: t('nav.chat', 'Chat') },
    { to: '/role', icon: UsersIcon, label: t('nav.roles', 'Roles') },
    { to: '/settings', icon: Settings, label: t('nav.settings', 'Settings') },
    { to: '/users', icon: User, label: t('nav.users', 'Users') },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--sider-bg)] border-t border-[var(--border-color)] safe-area-inset-bottom shadow-lg">
      <div className="flex items-center justify-around px-2 py-2 max-w-screen-sm mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[64px]',
                isActive
                  ? 'bg-indigo-600 text-white shadow-md scale-105'
                  : 'text-[var(--text-color-secondary)] hover:bg-[var(--item-hover-bg)] hover:text-[var(--text-color)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
