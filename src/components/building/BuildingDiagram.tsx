import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Layers3 } from 'lucide-react';
import { FloorSlab } from './FloorSlab';
import { RoomDetailDrawer } from './RoomDetailDrawer';
import { AddFloorModal, AddRoomModal, EditFloorModal } from './FloorRoomModals';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGetFloorsByBuildingQuery, useDeleteFloorMutation } from '@/store/api/buildingApi';
import { useGetUnitsQuery } from '@/store/api/unitApi';
import { toast } from 'sonner';
import type { Floor, Unit } from '@/types/building';

export function BuildingDiagram({ buildingId }: { buildingId: string }) {
  const { data: floorsData, isLoading: floorsLoading } = useGetFloorsByBuildingQuery(buildingId);
  const { data: unitsData, isLoading: unitsLoading } = useGetUnitsQuery({ buildingId });
  const [deleteFloor, { isLoading: deletingFloor }] = useDeleteFloorMutation();

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [addFloorOpen, setAddFloorOpen] = useState(false);
  const [editFloor, setEditFloor] = useState<Floor | null>(null);
  const [deleteFloorTarget, setDeleteFloorTarget] = useState<Floor | null>(null);
  const [addRoomFloor, setAddRoomFloor] = useState<Floor | null>(null);

  const floors = useMemo(() => [...(floorsData?.data ?? [])].sort((a, b) => b.floorNumber - a.floorNumber), [floorsData]);
  const unitsByFloor = useMemo(() => {
    const map = new Map<string, Unit[]>();
    for (const u of unitsData?.data ?? []) {
      const arr = map.get(u.floorNumber) ?? [];
      arr.push(u);
      map.set(u.floorNumber, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true }));
    return map;
  }, [unitsData]);

  const nextFloorNumber = floors.length ? Math.max(...floors.map((f) => f.floorNumber)) + 1 : 0;

  const suggestedUnitNumber = (floor: Floor) => {
    const existing = unitsByFloor.get(floor.floorNumber.toString()) ?? [];
    let max = 0;
    for (const u of existing) {
      const suffix = parseInt(u.unitNumber.replace(`${floor.floorNumber}`, ''), 10);
      if (!isNaN(suffix) && suffix > max) max = suffix;
    }
    return `${floor.floorNumber}${(max + 1).toString().padStart(2, '0')}`;
  };

  const onConfirmDeleteFloor = async () => {
    if (!deleteFloorTarget) return;
    try {
      await deleteFloor({ id: deleteFloorTarget._id, buildingId }).unwrap();
      toast.success(`${deleteFloorTarget.name} removed.`);
      setDeleteFloorTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not delete floor.', { description: err?.data?.suggestion });
    }
  };

  const loading = floorsLoading || unitsLoading;

  return (
    <div className="rounded-2xl border border-line bg-paper-dim/40 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <Layers3 className="size-4 text-crimson-500" />
          <span className="font-medium text-ink">{floors.length}</span> floor{floors.length !== 1 && 's'} ·{' '}
          <span className="font-medium text-ink">{unitsData?.data.length ?? 0}</span> room{(unitsData?.data.length ?? 0) !== 1 && 's'}
        </div>
        <Button size="sm" icon={<Plus className="size-4" />} onClick={() => setAddFloorOpen(true)}>Add floor</Button>
      </div>

      {!loading && floors.length === 0 ? (
        <EmptyState
          icon={<Layers3 className="size-6" />}
          title="No floors yet"
          description="Add your first floor to start mapping out rooms — like laying the first slab of the building."
          action={<Button icon={<Plus className="size-4" />} onClick={() => setAddFloorOpen(true)}>Add first floor</Button>}
        />
      ) : (
        <div className="flex flex-col-reverse gap-3">
          <AnimatePresence initial={false}>
            {floors.map((floor, i) => (
              <FloorSlab
                key={floor._id}
                floor={floor}
                units={unitsByFloor.get(floor.floorNumber.toString()) ?? []}
                loading={loading}
                editable
                index={i}
                onRoomClick={setSelectedUnit}
                onAddRoom={() => setAddRoomFloor(floor)}
                onEditFloor={() => setEditFloor(floor)}
                onDeleteFloor={() => setDeleteFloorTarget(floor)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <RoomDetailDrawer unit={selectedUnit} open={!!selectedUnit} onClose={() => setSelectedUnit(null)} />

      <AddFloorModal open={addFloorOpen} onClose={() => setAddFloorOpen(false)} buildingId={buildingId} nextFloorNumber={nextFloorNumber} />

      {editFloor && (
        <EditFloorModal
          open={!!editFloor}
          onClose={() => setEditFloor(null)}
          buildingId={buildingId}
          floorId={editFloor._id}
          currentName={editFloor.name}
          currentTotalUnits={(unitsByFloor.get(editFloor.floorNumber.toString()) ?? []).length}
        />
      )}

      {addRoomFloor && (
        <AddRoomModal
          open={!!addRoomFloor}
          onClose={() => setAddRoomFloor(null)}
          buildingId={buildingId}
          floorNumber={addRoomFloor.floorNumber}
          suggestedUnitNumber={suggestedUnitNumber(addRoomFloor)}
        />
      )}

      <ConfirmDialog
        open={!!deleteFloorTarget}
        onClose={() => setDeleteFloorTarget(null)}
        onConfirm={onConfirmDeleteFloor}
        loading={deletingFloor}
        title={`Delete ${deleteFloorTarget?.name}?`}
        description="All vacant rooms on this floor will be removed too. Floors with occupied or reserved rooms can't be deleted."
        confirmLabel="Delete floor"
      />
    </div>
  );
}
