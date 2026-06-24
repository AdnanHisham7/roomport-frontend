import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { MapPin, Layers3, DoorOpen, Wifi, Star, ChevronLeft, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Textarea } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { FloorSlab } from '@/components/building/FloorSlab';
import { RoomTile } from '@/components/building/RoomTile';
import { useGetPublicBuildingDetailQuery, useGetPublicBuildingUnitsQuery } from '@/store/api/publicApi';
import { useCreateInquiryMutation } from '@/store/api/inquiryApi';
import { PageLoader } from '@/components/ui/Avatar';
import { formatCurrency } from '@/utils/format';
import type { Unit } from '@/types/building';

export default function BuildingDetailPage() {
  const { buildingId } = useParams<{ buildingId: string }>();
  const { data, isLoading } = useGetPublicBuildingDetailQuery(buildingId!, { skip: !buildingId });
  const { data: unitsData } = useGetPublicBuildingUnitsQuery(buildingId!, { skip: !buildingId });
  const [createInquiry, { isLoading: sending }] = useCreateInquiryMutation();
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const { register, handleSubmit, reset } = useForm<{ name: string; email: string; phone: string; message: string }>();

  if (isLoading) return <PageLoader />;
  if (!data?.data) return <div className="p-8 text-center text-ink-soft">Listing not found.</div>;
  const b = data.data;
  const units = unitsData?.data ?? [];

  const unitsByFloor = new Map<string, Unit[]>();
  for (const u of units) {
    const arr = unitsByFloor.get(u.floorNumber) ?? [];
    arr.push(u);
    unitsByFloor.set(u.floorNumber, arr);
  }

  const sortedFloors = [...b.floors].sort((a, c) => c.floorNumber - a.floorNumber);

  const onInquire = async (values: { name: string; email: string; phone: string; message: string }) => {
    try {
      await createInquiry({ buildingId: b._id, unitId: selectedUnit?._id, ...values }).unwrap();
      toast.success("Thanks! We've sent your inquiry to the property manager.");
      reset();
      setSelectedUnit(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not send inquiry.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/listings" className="mb-5 flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ChevronLeft className="size-4" /> Back to listings
      </Link>

      {b.images?.[0] && (
        <div className="mb-6 overflow-hidden rounded-2xl">
          <img src={b.images[0]} alt={b.name} className="h-64 w-full object-cover sm:h-80" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold text-ink">{b.name}</h1>
              {b.isFeatured && <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600"><Star className="size-3.5" /> Featured</span>}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft"><MapPin className="size-4" />{b.location.address}, {b.location.city}, {b.location.state}</p>
            <div className="mt-3 flex gap-4 text-sm text-ink-soft">
              <span className="flex items-center gap-1.5"><Layers3 className="size-4 text-crimson-400" /> {b.totalFloors} floors</span>
              <span className="flex items-center gap-1.5"><DoorOpen className="size-4 text-crimson-400" /> {b.availableUnitsCount} available</span>
              {b.lift && <span className="flex items-center gap-1.5"><Wifi className="size-4 text-crimson-400" /> Lift</span>}
            </div>
            {b.minRent !== null && (
              <p className="mt-3 font-display text-xl font-semibold text-crimson-600">
                From {formatCurrency(b.minRent)} <span className="text-sm font-normal text-ink-soft">/ month</span>
              </p>
            )}
            {b.description && <p className="mt-4 text-sm leading-relaxed text-ink-soft">{b.description}</p>}
          </div>

          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Floor plan</h2>
            <p className="mb-3 text-xs text-ink-faint">Click any room to see details and inquire.</p>
            <div className="flex flex-col-reverse gap-3">
              <AnimatePresence initial={false}>
                {sortedFloors.map((floor, i) => (
                  <FloorSlab
                    key={floor._id}
                    floor={{ _id: floor._id, buildingId: b._id, floorNumber: floor.floorNumber, name: floor.name, totalUnits: floor.totalUnits, status: floor.status as any }}
                    units={unitsByFloor.get(floor.floorNumber.toString()) ?? []}
                    index={i}
                    editable={false}
                    onRoomClick={(u) => setSelectedUnit(u)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <AnimatePresence>
            {selectedUnit && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                <Card padding="md" className="border-crimson-200">
                  <p className="mb-0.5 text-xs font-medium text-crimson-500">Selected room</p>
                  <p className="font-mono text-base font-semibold text-ink">{selectedUnit.unitNumber}</p>
                  <p className="text-sm text-ink-soft">{selectedUnit.bedrooms}BR / {selectedUnit.bathrooms}BA · {formatCurrency(selectedUnit.rentAmount)}/mo</p>
                  <button onClick={() => setSelectedUnit(null)} className="mt-1 text-xs text-ink-faint hover:text-ink">Clear selection</button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Card padding="lg">
            <h3 className="mb-4 font-display text-base font-semibold text-ink">Enquire about this property</h3>
            <form onSubmit={handleSubmit(onInquire)} className="flex flex-col gap-3">
              <Input placeholder="Your name" {...register('name', { required: true })} />
              <Input type="email" placeholder="your@email.com" {...register('email', { required: true })} />
              <Input placeholder="Phone (optional)" {...register('phone')} />
              <Textarea placeholder={selectedUnit ? `I'm interested in room ${selectedUnit.unitNumber}…` : "Tell us what you're looking for…"} {...register('message')} />
              <Button type="submit" loading={sending} icon={<Send className="size-4" />} className="justify-center">Send inquiry</Button>
            </form>
          </Card>

          {b.amenities?.length ? (
            <Card padding="md">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-ink-faint">Amenities</p>
              <div className="flex flex-wrap gap-1.5">
                {b.amenities.map(a => <span key={a} className="rounded-full bg-paper-dim px-2.5 py-1 text-xs font-medium text-ink-soft">{a}</span>)}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
