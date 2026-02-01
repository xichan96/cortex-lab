import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // 这些页面有自己的折叠菜单按钮，不需要显示主导航的汉堡菜单
  const hasOwnToggle = ['/chat', '/role', '/settings', '/users'].some(
    path => location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[var(--body-bg)] text-[var(--text-color)] overflow-hidden font-sans">
      <div className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)} />
      <div className={`fixed left-0 top-0 h-full z-50 transition-transform lg:relative lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--body-bg)] relative">
        {!hasOwnToggle && (
          <div className="lg:hidden fixed top-3 left-3 z-30 sm:top-4 sm:left-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 sm:p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--item-hover-bg)] transition-colors shadow-md"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-auto pb-16 lg:pb-0">
          <Outlet />
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
