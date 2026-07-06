import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileSignature } from 'lucide-react';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { CreateAgreementModal } from '@/components/agreement/CreateAgreementModal';
import { useGetAgreementsQuery } from '@/store/api/agreementApi';
import { useGetTenantsQuery } from '@/store/api/tenantApi';
import { formatCurrency, formatDate } from '@/utils/format';

export default function AgreementsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useGetAgreementsQuery();
  const { data: tenantsData } = useGetTenantsQuery();
  const navigate = useNavigate();

  const tenantNames = new Map((tenantsData?.data ?? []).map((t) => [t._id, `${t.firstName} ${t.lastName}`]));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Agreements</h1>
          <p className="mt-1 text-sm text-ink-soft">Draft, send, and track lease e-signatures.</p>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>New agreement</Button>
      </div>

      <Card padding="none">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

        {!isLoading && !data?.data.length && (
          <EmptyState icon={<FileSignature className="size-6" />} title="No agreements yet" description="Draft a lease agreement and send it for e-signature." action={<Button icon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>New agreement</Button>} />
        )}

        <div className="divide-y divide-line">
          {data?.data.map((a) => (
            <button key={a._id} onClick={() => navigate(`/dashboard/agreements/${a._id}`)} className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition hover:bg-paper-dim sm:px-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{a.title}</p>
                <p className="truncate text-xs text-ink-faint">{tenantNames.get(a.tenantId) ?? 'Tenant'} · {formatDate(a.startDate)} – {formatDate(a.endDate)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="hidden text-sm text-ink-soft sm:block">{formatCurrency(a.monthlyRent)}/mo</span>
                <StatusPill status={a.status} />
              </div>
            </button>
          ))}
        </div>
      </Card>

      <CreateAgreementModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
