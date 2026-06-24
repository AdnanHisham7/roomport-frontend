import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { CreateTenantModal } from '@/components/tenant/CreateTenantModal';
import { useGetTenantsQuery } from '@/store/api/tenantApi';
import { formatCurrency, titleCase } from '@/utils/format';

export default function TenantsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useGetTenantsQuery();
  const navigate = useNavigate();

  const tenants = (data?.data ?? []).filter((t) =>
    `${t.firstName} ${t.lastName} ${t.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Tenants</h1>
          <p className="mt-1 text-sm text-ink-soft">Everyone renting across your buildings.</p>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>Add tenant</Button>
      </div>

      <Input placeholder="Search tenants..." leftIcon={<Search className="size-4" />} value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 max-w-sm" />

      <Card padding="none">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

        {!isLoading && tenants.length === 0 && (
          <EmptyState icon={<Users className="size-6" />} title="No tenants yet" description="Add a tenant to assign them to a room and start tracking rent." action={<Button icon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>Add tenant</Button>} />
        )}

        <div className="divide-y divide-line">
          {tenants.map((t) => (
            <button key={t._id} onClick={() => navigate(`/dashboard/tenants/${t._id}`)} className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition hover:bg-paper-dim sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar firstName={t.firstName} lastName={t.lastName} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{t.firstName} {t.lastName}</p>
                  <p className="truncate text-xs text-ink-faint">{t.email}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="hidden text-sm text-ink-soft sm:block">{formatCurrency(t.rentAmount)}/{titleCase(t.rentType).toLowerCase()}</span>
                <StatusPill status={t.status} />
              </div>
            </button>
          ))}
        </div>
      </Card>

      <CreateTenantModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
