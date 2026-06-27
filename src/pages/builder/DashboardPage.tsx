import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IndianRupee, Home, TrendingUp, Users, ArrowUpRight, Clock, FileWarning, X, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGetDashboardMetricsQuery } from '@/store/api/analyticsApi';
import { useGetBuildingsQuery } from '@/store/api/buildingApi';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import type { TransactionRecord } from '@/types/analytics';
import { cn } from '@/utils/cn';

// ── Transaction History Modal ────────────────────────────────────────────────
function TransactionHistoryModal({
  open,
  onClose,
  transactions,
}: {
  open:         boolean;
  onClose:      () => void;
  transactions: TransactionRecord[];
}) {
  console.log("thi sis transactions", transactions)
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-pop)]"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h3 className="font-display text-base font-semibold text-ink">Transaction History</h3>
                <p className="text-xs text-ink-faint mt-0.5">All recorded payments</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-ink-faint hover:bg-paper-dim hover:text-ink">
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="py-10 text-center text-sm text-ink-faint">No transactions recorded yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-paper-dim text-xs text-ink-faint">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Tenant</th>
                      <th className="px-4 py-2.5 text-left">Period</th>
                      <th className="px-4 py-2.5 text-left">Room</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                      <th className="px-4 py-2.5 text-left">Paid at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {transactions.map((t) => (
                      <tr key={t._id} className="hover:bg-paper-dim/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-ink">{t.tenantName}</td>
                        <td className="px-4 py-3 text-ink-soft">{t.periodLabel}</td>
                        <td className="px-4 py-3 text-ink-soft">{t.unitNumber ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-sage-700">{formatCurrency(t.amount)}</td>
                        <td className="px-4 py-3 text-ink-faint">{t.paidAt ? formatDateTime(t.paidAt) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, sub, delay = 0, onClick, clickable = false,
}: {
  icon:      React.ReactNode;
  label:     string;
  value:     string;
  sub?:      string;
  delay?:    number;
  onClick?:  () => void;
  clickable?: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card
        padding="md"
        className={cn('flex items-start justify-between', clickable && 'cursor-pointer hover:shadow-md hover:border-crimson-300 transition-shadow')}
        onClick={onClick}
      >
        <div>
          <p className="text-xs font-medium text-ink-faint">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-semibold text-ink">{value}</p>
          {sub && <p className="mt-1 text-xs text-sage-600">{sub}</p>}
          {clickable && <p className="mt-1 text-[10px] text-ink-faint">Click to view history</p>}
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl bg-crimson-50 text-crimson-500">{icon}</span>
      </Card>
    </motion.div>
  );
}

const PIE_COLORS = ['#c81e3d', '#ece0de'];

// ── Dashboard Page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data, isLoading }   = useGetDashboardMetricsQuery();
  const { data: buildingsData } = useGetBuildingsQuery();
  const { user }               = useAuth();
  const [txnModalOpen, setTxnModalOpen] = useState(false);

  if (isLoading) return <PageLoader />;
  const metrics      = data?.data;
  const buildingNames = new Map((buildingsData?.data ?? []).map((b) => [b._id, b.name]));

  const chartData = (metrics?.revenueByBuilding ?? []).map((r) => ({
    name:    buildingNames.get(r.buildingId) ?? 'Building',
    revenue: r.revenue,
  }));

  const occ     = metrics?.occupancyRate;
  const pieData = occ ? [{ name: 'Occupied', value: occ.occupiedUnits }, { name: 'Vacant', value: occ.vacantUnits }] : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Welcome back, {user?.first_name}</h1>
      <p className="mt-1 mb-6 text-sm text-ink-soft">Here's how your portfolio is performing.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<IndianRupee className="size-5" />}
          label="Total revenue"
          value={formatCurrency(metrics?.totalRevenue ?? 0)}
          sub={metrics?.recentTransactions?.length ? `${metrics.recentTransactions.length} transactions` : undefined}
          delay={0}
          clickable
          onClick={() => setTxnModalOpen(true)}
        />
        <StatCard
          icon={<AlertCircle className="size-5" />}
          label="Pending revenue"
          value={formatCurrency(metrics?.pendingRevenue ?? 0)}
          sub="Across all tenants"
          delay={0.05}
        />
        <StatCard
          icon={<TrendingUp className="size-5" />}
          label="Occupancy rate"
          value={`${occ?.ratePercentage ?? 0}%`}
          sub={`${occ?.occupiedUnits ?? 0} of ${occ?.totalUnits ?? 0} rooms`}
          delay={0.1}
        />
        <StatCard
          icon={<Home className="size-5" />}
          label="Vacant rooms"
          value={String(occ?.vacantUnits ?? 0)}
          delay={0.15}
        />
      </div>

      {/* Pending payments alert */}
      {(metrics?.pendingPayments?.length ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
        >
          <p className="text-sm font-medium text-amber-800">
            {metrics!.pendingPayments.length} tenant{metrics!.pendingPayments.length !== 1 ? 's have' : ' has'} pending payments
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {metrics!.pendingPayments.slice(0, 5).map((p) => (
              <span key={p.tenantId} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] text-amber-800">
                {p.tenantName} — {formatCurrency(p.amount)} ({p.periodLabel})
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" padding="lg">
          <h3 className="mb-4 font-display text-base font-semibold text-ink">Revenue by building</h3>
          {chartData.length === 0 ? (
            <EmptyState title="No revenue data yet" description="Once payments are recorded, you'll see building-wise revenue here." />
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
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-ink">
            <Clock className="size-4 text-crimson-500" /> Recently rented
          </h3>
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
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-ink">
            <FileWarning className="size-4 text-amber-500" /> Expiring agreements
          </h3>
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

      <TransactionHistoryModal
        open={txnModalOpen}
        onClose={() => setTxnModalOpen(false)}
        transactions={metrics?.recentTransactions ?? []}
      />
    </div>
  );
}
