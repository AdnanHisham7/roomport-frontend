import { useState } from 'react';
import { Search, Star, Globe, EyeOff, Trash2, Building2, StarOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { StatusPill, Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { useGetSuperAdminBuildingsQuery, useToggleBuildingFeatureMutation, useToggleBuildingPublishMutation, useDeleteSuperAdminBuildingMutation } from '@/store/api/superAdminApi';

export default function BuildingsModerationPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { data, isLoading } = useGetSuperAdminBuildingsQuery({ search: search || undefined, page, limit: 20 });
  const [toggleFeature] = useToggleBuildingFeatureMutation();
  const [togglePublish] = useToggleBuildingPublishMutation();
  const [deleteBuilding, { isLoading: deleting }] = useDeleteSuperAdminBuildingMutation();

  const act = async (fn: () => Promise<any>, msg: string) => {
    try { await fn(); toast.success(msg); } catch (err: any) { toast.error(err?.data?.message ?? 'Action failed.'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Buildings</h1>
        <p className="mt-1 text-sm text-ink-soft">Moderate all listings across the platform.</p>
      </div>

      <Input placeholder="Search buildings…" leftIcon={<Search className="size-4" />} value={search} onChange={e => setSearch(e.target.value)} className="mb-4 max-w-sm" />

      <Card padding="none">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && !data?.data.length && <EmptyState icon={<Building2 className="size-6" />} title="No buildings found" />}
        <div className="divide-y divide-line">
          {data?.data.map(b => (
            <div key={b._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-ink">{b.name}</p>
                  {b.isFeatured && <Badge tone="amber"><Star className="size-2.5" /> Featured</Badge>}
                </div>
                <p className="truncate text-xs text-ink-faint">{(b as any).ownerName} · {b.location.city}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={b.isPublished ? 'active' : 'inactive'} />
                <Button size="sm" variant="ghost" icon={b.isFeatured ? <StarOff className="size-3.5" /> : <Star className="size-3.5" />} onClick={() => act(() => toggleFeature({ id: b._id, isFeatured: !b.isFeatured }).unwrap(), b.isFeatured ? 'Unfeatured.' : 'Featured!')} />
                <Button size="sm" variant="ghost" icon={b.isPublished ? <EyeOff className="size-3.5" /> : <Globe className="size-3.5" />} onClick={() => act(() => togglePublish({ id: b._id, isPublished: !b.isPublished }).unwrap(), b.isPublished ? 'Unpublished.' : 'Published.')} />
                <Button size="sm" variant="ghost" icon={<Trash2 className="size-3.5 text-crimson-500" />} onClick={() => setDeleteTarget(b._id)} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {data && data.totalPages > 1 && <div className="mt-5"><Pagination page={page} totalPages={data.totalPages} onChange={setPage} /></div>}

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) { try { await deleteBuilding(deleteTarget).unwrap(); toast.success('Building deleted.'); setDeleteTarget(null); } catch (err: any) { toast.error(err?.data?.message ?? 'Could not delete.'); } } }} loading={deleting} title="Delete this building?" description="Removes all floors and rooms. Can't delete buildings with occupied rooms." confirmLabel="Delete building" />
    </div>
  );
}
