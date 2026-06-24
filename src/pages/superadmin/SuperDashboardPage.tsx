import { motion } from 'framer-motion';
import { Building2, Users2, DoorOpen, CreditCard, Globe, Star, TrendingUp, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Avatar';
import { useGetPlatformStatsQuery } from '@/store/api/superAdminApi';
import { formatCurrency } from '@/utils/format';

function Stat({ label, value, sub, icon, delay = 0 }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card padding="md" className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-faint">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-semibold text-ink">{value}</p>
          {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl bg-crimson-50 text-crimson-500">{icon}</span>
      </Card>
    </motion.div>
  );
}

export default function SuperDashboardPage() {
  const { data, isLoading } = useGetPlatformStatsQuery();
  if (isLoading) return <PageLoader />;
  const s = data?.data;
  if (!s) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Platform Overview</h1>
        <p className="mt-1 text-sm text-ink-soft">Real-time metrics across the entire Brift platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Builders" value={s.totalBuilders} sub={`+${s.newBuildersLast30Days} in last 30 days`} icon={<Users2 className="size-5" />} delay={0} />
        <Stat label="Buildings" value={s.totalBuildings} sub={`${s.publishedBuildings} published`} icon={<Building2 className="size-5" />} delay={0.05} />
        <Stat label="Total rooms" value={s.totalRooms} sub={`${s.occupiedRooms} occupied`} icon={<DoorOpen className="size-5" />} delay={0.1} />
        <Stat label="Revenue" value={formatCurrency(s.totalRevenue)} sub={`${s.activeSubscriptions} active subs`} icon={<CreditCard className="size-5" />} delay={0.15} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Occupancy rate" value={`${s.occupancyRate}%`} icon={<TrendingUp className="size-5" />} delay={0.2} />
        <Stat label="Published listings" value={s.publishedBuildings} icon={<Globe className="size-5" />} delay={0.25} />
        <Stat label="Inquiries" value={s.totalInquiries} sub={`+${s.newInquiriesLast30Days} this month`} icon={<Star className="size-5" />} delay={0.3} />
        <Stat label="Managers" value={s.totalManagers} icon={<UserPlus className="size-5" />} delay={0.35} />
      </div>
    </div>
  );
}
