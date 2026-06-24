import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DollarSign, Home, TrendingUp, Users, ArrowUpRight, Clock, FileWarning } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGetDashboardMetricsQuery } from '@/store/api/analyticsApi';
import { useGetBuildingsQuery } from '@/store/api/buildingApi';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDate } from '@/utils/format';

function StatCard({ icon, label, value, sub, delay = 0 }: { icon: React.ReactNode; label: string; value: string; sub?: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card padding="md" className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-faint">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-semibold text-ink">{value}</p>
          {sub && <p className="mt-1 text-xs text-sage-600">{sub}</p>}
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl bg-crimson-50 text-crimson-500">{icon}</span>
      </Card>
    </motion.div>
  );
}

const PIE_COLORS = ['#c81e3d', '#ece0de'];

export default function DashboardPage() {
  const { data, isLoading } = useGetDashboardMetricsQuery();
  const { data: buildingsData } = useGetBuildingsQuery();
  const { user } = useAuth();

  if (isLoading) return <PageLoader />;
  const metrics = data?.data;
  const buildingNames = new Map((buildingsData?.data ?? []).map((b) => [b._id, b.name]));

  const chartData = (metrics?.revenueByBuilding ?? []).map((r) => ({
    name: buildingNames.get(r.buildingId) ?? 'Building',
    revenue: r.revenue,
  }));

  const occ = metrics?.occupancyRate;
  const pieData = occ ? [{ name: 'Occupied', value: occ.occupiedUnits }, { name: 'Vacant', value: occ.vacantUnits }] : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Welcome back, {user?.first_name}</h1>
      <p className="mt-1 mb-6 text-sm text-ink-soft">Here's how your portfolio is performing.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<DollarSign className="size-5" />} label="Total revenue" value={formatCurrency(metrics?.totalRevenue ?? 0)} delay={0} />
        <StatCard icon={<TrendingUp className="size-5" />} label="Occupancy rate" value={`${occ?.ratePercentage ?? 0}%`} sub={`${occ?.occupiedUnits ?? 0} of ${occ?.totalUnits ?? 0} rooms`} delay={0.05} />
        <StatCard icon={<Home className="size-5" />} label="Vacant rooms" value={String(occ?.vacantUnits ?? 0)} delay={0.1} />
        <StatCard icon={<Users className="size-5" />} label="Buildings" value={String(buildingsData?.data.length ?? 0)} delay={0.15} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" padding="lg">
          <h3 className="mb-4 font-display text-base font-semibold text-ink">Revenue by building</h3>
          {chartData.length === 0 ? (
            <EmptyState title="No revenue data yet" description="Once leases start generating rent, you'll see it here." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece0de" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b5458' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b5458' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => formatCurrency(Number(v))}
                  contentStyle={{ borderRadius: 12, border: '1px solid #ece0de', fontSize: 12.5 }}
                />
                <Bar dataKey="revenue" fill="#c81e3d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card padding="lg">
          <h3 className="mb-4 font-display text-base font-semibold text-ink">Occupancy</h3>
          {!occ || occ.totalUnits === 0 ? (
            <EmptyState title="No rooms yet" />
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={75} paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ece0de', fontSize: 12.5 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-crimson-500" /> Occupied</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-paper-deep" /> Vacant</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card padding="lg">
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-ink"><Clock className="size-4 text-crimson-500" /> Recently rented</h3>
          {!metrics?.recentlyRentedUnits.length ? (
            <p className="text-sm text-ink-faint">No recent activity.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {metrics.recentlyRentedUnits.slice(0, 5).map((u) => (
                <div key={u.unitId} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-ink-soft">{formatDate(u.startDate)}</span>
                  <span className="font-medium text-ink">{formatCurrency(u.rentAmount)}/mo</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padding="lg">
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-ink"><FileWarning className="size-4 text-amber-500" /> Expiring agreements</h3>
          {!metrics?.expiringAgreements.length ? (
            <p className="text-sm text-ink-faint">Nothing expiring soon.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {metrics.expiringAgreements.slice(0, 5).map((a) => (
                <Link key={a.agreementId} to={`/dashboard/agreements/${a.agreementId}`} className="flex items-center justify-between py-2.5 text-sm hover:text-crimson-600">
                  <span className="text-ink-soft">Ends {formatDate(a.endDate)}</span>
                  <span className="flex items-center gap-1 font-medium">{formatCurrency(a.monthlyRent)} <ArrowUpRight className="size-3" /></span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
