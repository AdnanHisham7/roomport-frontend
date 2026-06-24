import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Sparkles } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-gradient-to-br from-crimson-600 via-crimson-700 to-ink p-10 text-white lg:flex">
        <div className="texture-grid absolute inset-0 opacity-20" />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 left-0 size-80 rounded-full bg-crimson-300/20 blur-3xl"
        />

        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Building2 className="size-5" />
          </span>
          <span className="font-display text-xl font-semibold">Brift</span>
        </Link>

        <div className="relative z-10 max-w-sm">
          <div className="mb-4 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur w-fit">
            <Sparkles className="size-3.5" /> Built for builders
          </div>
          <h2 className="font-display text-3xl font-semibold leading-tight">
            Every floor, every room — one living blueprint.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/75">
            Manage tenants, leases, and rent collection across your entire portfolio with a building view that feels as real as the property itself.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/50">© {new Date().getFullYear()} Brift. All rights reserved.</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-paper px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
