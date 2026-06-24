import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, UserCog, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { PageLoader } from '@/components/ui/Avatar';
import { useGetBuilderDetailQuery } from '@/store/api/superAdminApi';
import { formatCurrency, formatDate } from '@/utils/format';

export default function BuilderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetBuilderDetailQuery(id!, { skip: !id });

  if (isLoading) return <PageLoader />;
  const b = data?.data;
  if (!b) return <p className="text-ink-soft">Builder not found.</p>;

  return (
    <div className="mx-auto max-w-4xl">
      <button onClick={() => navigate('/super-admin/builders')} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" /> Builders
      </button>

      <div className="mb-6 flex items-center gap-4">
        <Avatar firstName={b.first_name} lastName={b.last_name} size="lg" />
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{b.first_name} {b.last_name}</h1>
          <p className="mt-1 text-sm text-ink-soft">{b.email} · Joined {formatDate(b.createdAt)}</p>
        </div>
        <StatusPill status={b.status} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Card padding="lg">
            <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold text-ink"><Building2 className="size-4 text-crimson-500" /> Buildings ({b.buildings.length})</h3>
            {!b.buildings.length ? <p className="text-xs text-ink-faint">No buildings.</p> : (
              <div className="flex flex-col gap-2">
                {b.buildings.map(bl => (
                  <div key={bl._id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-ink">{bl.name}</p>
                      <p className="text-xs text-ink-faint">{bl.totalFloors} floors · {bl.totalUnits} rooms</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill status={bl.status} />
                      {bl.isPublished && <span className="text-xs font-medium text-sage-500">Live</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card padding="lg">
            <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold text-ink"><UserCog className="size-4 text-crimson-500" /> Managers ({b.managers.length})</h3>
            {!b.managers.length ? <p className="text-xs text-ink-faint">No managers.</p> : (
              <div className="flex flex-col gap-2">
                {b.managers.map(m => (
                  <div key={m._id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar firstName={m.first_name} lastName={m.last_name} size="xs" />
                      <p className="text-sm font-medium text-ink">{m.first_name} {m.last_name}</p>
                    </div>
                    <StatusPill status={m.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card padding="lg">
          <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold text-ink"><CreditCard className="size-4 text-crimson-500" /> Subscription</h3>
          {!b.subscription ? <p className="text-xs text-ink-faint">No active subscription.</p> : (
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between"><span className="text-ink-faint">Status</span><StatusPill status={b.subscription.status} /></div>
              <div className="flex justify-between"><span className="text-ink-faint">Amount</span><span className="font-medium">{formatCurrency(b.subscription.amount)}</span></div>
              <div className="flex justify-between"><span className="text-ink-faint">Buildings</span><span>{b.subscription.numberOfBuildings}</span></div>
              <div className="flex justify-between"><span className="text-ink-faint">Rooms</span><span>{b.subscription.numberOfUnits}</span></div>
              <div className="flex justify-between"><span className="text-ink-faint">Due date</span><span>{formatDate(b.subscription.dueDate)}</span></div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
