import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Trash2, Building2, MapPin, Layers3 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button, Input, Select } from '@/components/ui';
import { useCreateBuildingMutation } from '@/store/api/buildingApi';
import { useNavigate } from 'react-router-dom';

const buildingTypeOptions = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed', label: 'Mixed use' },
  { value: 'industrial', label: 'Industrial' },
];

interface FormValues {
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  floors: { floorNumber: number; name: string; totalUnits: number }[];
}

export function CreateBuildingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [createBuilding, { isLoading }] = useCreateBuildingMutation();
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'floors'>('info');

  const { register, handleSubmit, control, trigger, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      country: 'United States',
      floors: [{ floorNumber: 0, name: 'Ground Floor', totalUnits: 4 }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'floors' });

  const goToFloors = async () => {
    const valid = await trigger(['name', 'type', 'address', 'city', 'state', 'pincode', 'country']);
    if (valid) setStep('floors');
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const floorsRecord: Record<string, number> = {};
      values.floors.forEach((f) => { floorsRecord[f.floorNumber.toString()] = Number(f.totalUnits); });
      const totalUnits = values.floors.reduce((s, f) => s + Number(f.totalUnits), 0);

      const res = await createBuilding({
        name: values.name,
        type: values.type,
        totalUnits,
        location: { address: values.address, city: values.city, state: values.state, pincode: values.pincode, country: values.country },
        floors: floorsRecord,
      }).unwrap();

      toast.success(`${values.name} created!`);
      onClose();
      navigate(`/dashboard/buildings/${res.data._id}`);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not create building.', { description: err?.data?.suggestion });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a new building" description={step === 'info' ? 'Tell us the basics' : 'Lay out the floors — rooms generate automatically'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 'info' && (
          <div className="flex flex-col gap-4">
            <Input label="Building name" placeholder="e.g. Maple Court Apartments" leftIcon={<Building2 className="size-4" />} error={errors.name?.message} {...register('name', { required: 'Required' })} />
            <Select label="Type" options={buildingTypeOptions} {...register('type', { required: true })} />
            <div className="border-t border-line pt-4">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink"><MapPin className="size-4" /> Location</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input label="Address" className="sm:col-span-2" error={errors.address?.message} {...register('address', { required: 'Required' })} />
                <Input label="City" error={errors.city?.message} {...register('city', { required: 'Required' })} />
                <Input label="State" error={errors.state?.message} {...register('state', { required: 'Required' })} />
                <Input label="Pincode" error={errors.pincode?.message} {...register('pincode', { required: 'Required' })} />
                <Input label="Country" error={errors.country?.message} {...register('country', { required: 'Required' })} />
              </div>
            </div>
            <Button type="button" onClick={goToFloors} className="mt-2 w-fit justify-center">Continue to floors</Button>
          </div>
        )}

        {step === 'floors' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-ink"><Layers3 className="size-4" /> Floors</div>
            <div className="flex flex-col gap-2.5">
              {fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-[1fr_1.4fr_1fr_auto] items-end gap-2 rounded-xl border border-line bg-paper-dim/50 p-2.5">
                  <Input label="No." type="number" {...register(`floors.${i}.floorNumber`, { valueAsNumber: true, required: true })} />
                  <Input label="Floor name" {...register(`floors.${i}.name`, { required: true })} />
                  <Input label="Rooms" type="number" min={0} {...register(`floors.${i}.totalUnits`, { valueAsNumber: true, required: true, min: 0 })} />
                  <button type="button" onClick={() => remove(i)} disabled={fields.length === 1} className="mb-0.5 flex size-10 items-center justify-center rounded-lg text-crimson-500 hover:bg-crimson-50 disabled:opacity-30">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" icon={<Plus className="size-4" />} className="w-fit" onClick={() => append({ floorNumber: fields.length, name: `Floor ${fields.length}`, totalUnits: 4 })}>
              Add another floor
            </Button>

            <div className="mt-2 flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep('info')}>Back</Button>
              <Button type="submit" loading={isLoading} className="flex-1 justify-center">Create building</Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
