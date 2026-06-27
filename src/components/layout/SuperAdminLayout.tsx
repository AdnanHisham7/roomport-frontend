import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { BuilderTopbar } from './BuilderTopbar';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/utils/cn';

const titleMap: Record<string, string> = {
  '/super-admin':                'Platform Overview',
  '/super-admin/builders':       'Builders',
  '/super-admin/buildings':      'Buildings',
  '/super-admin/subscriptions':  'Subscriptions',
  '/super-admin/demo-requests':  'Demo Requests',
  '/super-admin/activity':       'Activity Log',
  '/super-admin/settings':       'Platform Settings',
};

export function SuperAdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const location  = useLocation();

  // Match exact or prefix (e.g. /super-admin/builders/123 → 'Builders')
  const title =
    titleMap[location.pathname] ??
    Object.entries(titleMap)
      .filter(([k]) => k !== '/super-admin' && location.pathname.startsWith(k))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ??
    'Super Admin';

  return (
    <div className="flex h-screen overflow-hidden bg-paper texture-grid">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden shrink-0 transition-[width] duration-200 lg:block',
          collapsed ? 'w-[76px]' : 'w-64'
        )}
      >
        <SuperAdminSidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <SuperAdminSidebar mobile onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <BuilderTopbar onMenuClick={() => setMobileOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
