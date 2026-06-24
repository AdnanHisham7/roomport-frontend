import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, MapPin, Layers3, DoorOpen, Globe, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { CreateBuildingModal } from '@/components/building/CreateBuildingModal';
import { useGetBuildingsQuery } from '@/store/api/buildingApi';
import { Building2 } from 'lucide-react';

export default function BuildingsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useGetBuildingsQuery();
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Buildings</h1>
          <p className="mt-1 text-sm text-ink-soft">Manage your portfolio, floor by floor.</p>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>Add building</Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && !data?.data.length && (
        <EmptyState
          icon={<Building2 className="size-6" />}
          title="No buildings yet"
          description="Add your first building to start mapping floors and rooms."
          action={<Button icon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>Add your first building</Button>}
        />
      )}

      {!isLoading && !!data?.data.length && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((b, i) => (
            <motion.div key={b._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card hover padding="none" className="cursor-pointer overflow-hidden" onClick={() => navigate(`/dashboard/buildings/${b._id}`)}>
                <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-crimson-100 to-paper-deep">
                  {b.images?.[0] ? (
                    <img src={b.images[0]} alt={b.name} className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-crimson-300"><Building2 className="size-10" /></div>
                  )}
                  <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                    {b.isPublished ? (
                      <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-sage-600"><Globe className="size-2.5" /> Live</span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-ink-faint"><EyeOff className="size-2.5" /> Draft</span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h3 className="truncate font-display text-base font-semibold text-ink">{b.name}</h3>
                    <StatusPill status={b.status} className="shrink-0" />
                  </div>
                  <p className="mb-3 flex items-center gap-1 text-xs text-ink-faint"><MapPin className="size-3" /> {b.location.city}, {b.location.state}</p>
                  <div className="flex items-center gap-4 border-t border-line pt-3 text-xs text-ink-soft">
                    <span className="flex items-center gap-1"><Layers3 className="size-3.5 text-crimson-400" /> {b.totalFloors} floors</span>
                    <span className="flex items-center gap-1"><DoorOpen className="size-3.5 text-crimson-400" /> {b.totalUnits} rooms</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <CreateBuildingModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
