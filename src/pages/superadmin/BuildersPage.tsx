import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users2, ShieldOff, ShieldCheck, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Select } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { useGetBuildersQuery, useUpdateBuilderStatusMutation } from '@/store/api/superAdminApi';
import { formatDate } from '@/utils/format';

export default function BuildersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading } = useGetBuildersQuery({ search: search || undefined, status: status || undefined, page, limit: 20 });
  const [updateStatus, { isLoading: updating }] = useUpdateBuilderStatusMutation();

  const toggle = async (id: string, current: string) => {
    const next = current === 'active' ? 'suspended' : 'active';
    try {
      await updateStatus({ id, status: next }).unwrap();
      toast.success(`Builder ${next === 'active' ? 'activated' : 'suspended'}.`);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not update status.');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Builders</h1>
        <p className="mt-1 text-sm text-ink-soft">All registered property managers and building owners.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search by name or email…" leftIcon={<Search className="size-4" />} value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={status} onChange={e => setStatus(e.target.value)} options={[{ value: '', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }, { value: 'inactive', label: 'Inactive' }]} className="w-40" />
      </div>

      <Card padding="none">
        {isLoading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && !data?.data.length && <EmptyState icon={<Users2 className="size-6" />} title="No builders found" />}
        <div className="divide-y divide-line">
          {data?.data.map(b => (
            <div key={b._id} className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
              <button onClick={() => navigate(`/super-admin/builders/${b._id}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <Avatar firstName={b.first_name} lastName={b.last_name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{b.first_name} {b.last_name}</p>
                  <p className="truncate text-xs text-ink-faint">{b.email} · Joined {formatDate(b.createdAt)}</p>
                </div>
              </button>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-xs text-ink-faint sm:block">{b.buildingsCount}B / {b.unitsCount}R</span>
                <StatusPill status={b.status} />
                <Button size="sm" variant={b.status === 'active' ? 'danger' : 'subtle'} icon={b.status === 'active' ? <ShieldOff className="size-3.5" /> : <ShieldCheck className="size-3.5" />} onClick={() => toggle(b._id, b.status)} disabled={updating}>
                  {b.status === 'active' ? 'Suspend' : 'Activate'}
                </Button>
                <button onClick={() => navigate(`/super-admin/builders/${b._id}`)} className="text-ink-faint hover:text-ink"><ChevronRight className="size-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {data && data.totalPages > 1 && <div className="mt-5"><Pagination page={page} totalPages={data.totalPages} onChange={setPage} /></div>}
    </div>
  );
}
