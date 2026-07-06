import { useState } from 'react';
import { ArrowRightLeft, Building2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui';
import { useTransferTenantMutation } from '@/store/api/tenantApi';
import { useGetUnitsQuery } from '@/store/api/unitApi';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';
import type { Unit } from '@/types/building';

interface Props {
  open:       boolean;
  onClose:    () => void;
  tenant: {
    _id:       string;
    firstName: string;
    lastName:  string;
    unitId?:   string;
  };
  buildingId: string;
}

export function TransferTenantModal({ open, onClose, tenant, buildingId }: Props) {
  const [selectedUnit, setSelectedUnit]   = useState<string>('');
  const [transferTenant, { isLoading }]   = useTransferTenantMutation();
  const { data: unitsData, isLoading: loadingUnits } = useGetUnitsQuery({ buildingId });

  // Only show available and occupied rooms, exclude the tenant's current room
  const eligibleUnits = (unitsData?.data ?? []).filter(
    (u) =>
      u._id !== tenant.unitId &&
      (u.status === 'available' || u.status === 'occupied')
  );

  const selectedUnitData = eligibleUnits.find(u => u._id === selectedUnit);
  const isSwap = selectedUnitData?.status === 'occupied';

  const handleTransfer = async () => {
    if (!selectedUnit) {
      toast.error('Please select a target room.');
      return;
    }
    try {
      const result = await transferTenant({ tenantId: tenant._id, targetUnitId: selectedUnit }).unwrap();
      toast.success(result.message ?? 'Tenant transferred successfully.');
      setSelectedUnit('');
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Transfer failed.', { description: err?.data?.suggestion });
    }
  };

  const statusBadge = (unit: Unit) => {
    if (unit.status === 'occupied') return <span className="rounded-full bg-crimson-100 px-2 py-0.5 text-[10px] font-medium text-crimson-700">Occupied (Swap)</span>;
    return <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[10px] font-medium text-sage-700">Available</span>;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Transfer Tenant"
      description={`Move ${tenant.firstName} ${tenant.lastName} to a different room.`}
    >
      <div className="space-y-4">
        {isSwap && selectedUnitData && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <strong>Room swap:</strong> The current tenant in {selectedUnitData.unitNumber} will be moved to {tenant.unitId ? `the current room` : 'no room (unassigned)'}.
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-ink">Select target room</p>
          {loadingUnits ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-paper-deep" />)}
            </div>
          ) : eligibleUnits.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-faint">No available or occupied rooms to transfer to.</p>
          ) : (
            <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {eligibleUnits.map((unit) => (
                <button
                  key={unit._id}
                  onClick={() => setSelectedUnit(unit._id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border-2 p-3 text-left transition-colors',
                    selectedUnit === unit._id
                      ? 'border-crimson-500 bg-crimson-50'
                      : 'border-line bg-white hover:border-ink-faint hover:bg-paper-dim'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="size-4 text-ink-faint" />
                    <div>
                      <p className="text-sm font-semibold text-ink">Room {unit.unitNumber}</p>
                      <p className="text-xs text-ink-faint">{formatCurrency(unit.rentAmount)}/mo · Floor {unit.floorNumber}</p>
                    </div>
                  </div>
                  {statusBadge(unit)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            icon={<ArrowRightLeft className="size-4" />}
            onClick={handleTransfer}
            loading={isLoading}
            disabled={!selectedUnit}
          >
            {isSwap ? 'Swap rooms' : 'Transfer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
