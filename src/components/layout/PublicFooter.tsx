import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-paper-dim/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-crimson-500 to-crimson-700 text-white">
                <Building2 className="size-4" />
              </span>
              <span className="font-display text-base font-semibold">Brift</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              Discover rooms and spaces, or run your entire rental portfolio — floor by floor, room by room.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:gap-16">
            <div>
              <p className="mb-3 font-medium text-ink">Renters</p>
              <div className="flex flex-col gap-2 text-ink-soft">
                <Link to="/listings" className="hover:text-crimson-600">Browse spaces</Link>
              </div>
            </div>
            <div>
              <p className="mb-3 font-medium text-ink">Builders</p>
              <div className="flex flex-col gap-2 text-ink-soft">
                <Link to="/get-started" className="hover:text-crimson-600">List a property</Link>
                <Link to="/login" className="hover:text-crimson-600">Sign in</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-line pt-6 text-xs text-ink-faint">
          © {new Date().getFullYear()} Brift. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
