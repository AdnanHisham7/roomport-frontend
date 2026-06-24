import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Menu, LogOut, User, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { useGetNotificationsQuery, useGetUnreadCountQuery, useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation } from '@/store/api/notificationApi';
import { timeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onOutside]);
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const { data: countData } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const { data: listData } = useGetNotificationsQuery(undefined, { skip: !open });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const count = countData?.data?.count ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="relative flex size-9.5 items-center justify-center rounded-full text-ink-soft transition hover:bg-paper-dim hover:text-ink">
        <Bell className="size-[18px]" />
        {count > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-crimson-500 text-[9px] font-bold text-white ring-2 ring-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-pop)]"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-display text-sm font-semibold">Notifications</span>
              {count > 0 && (
                <button onClick={() => markAllRead()} className="flex items-center gap-1 text-xs font-medium text-crimson-600 hover:text-crimson-700">
                  <Check className="size-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {!listData?.data.length && (
                <div className="px-4 py-10 text-center text-sm text-ink-faint">You're all caught up.</div>
              )}
              {listData?.data.map((n) => (
                <button
                  key={n._id}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={cn('flex w-full flex-col gap-0.5 border-b border-line/60 px-4 py-3 text-left transition hover:bg-paper-dim', !n.isRead && 'bg-crimson-50/40')}
                >
                  <div className="flex items-center gap-2">
                    {!n.isRead && <span className="size-1.5 shrink-0 rounded-full bg-crimson-500" />}
                    <span className="text-[13px] font-medium text-ink">{n.title}</span>
                  </div>
                  <p className="line-clamp-2 text-xs text-ink-soft">{n.message}</p>
                  <span className="mt-0.5 text-[10.5px] text-ink-faint">{timeAgo(n.createdAt)}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const { user, logout } = useAuth();

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full p-0.5 pr-2.5 transition hover:bg-paper-dim">
        <Avatar firstName={user?.first_name} lastName={user?.last_name} size="sm" />
        <span className="hidden text-[13px] font-medium text-ink sm:block">{user?.first_name}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-[var(--shadow-pop)]"
          >
            <div className="px-3 py-2.5">
              <p className="truncate text-[13px] font-medium text-ink">{user?.first_name} {user?.last_name}</p>
              <p className="truncate text-xs text-ink-faint">{user?.email}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            <Link to="/dashboard/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-ink-soft transition hover:bg-paper-dim hover:text-ink">
              <User className="size-4" /> Profile
            </Link>
            <button onClick={() => logout()} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-crimson-600 transition hover:bg-crimson-50">
              <LogOut className="size-4" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function BuilderTopbar({ onMenuClick, title }: { onMenuClick: () => void; title?: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/70 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-1.5 text-ink-soft hover:bg-paper-dim lg:hidden">
          <Menu className="size-5" />
        </button>
        {title && <h1 className="font-display text-[17px] font-semibold text-ink">{title}</h1>}
      </div>
      <div className="flex items-center gap-1.5">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
