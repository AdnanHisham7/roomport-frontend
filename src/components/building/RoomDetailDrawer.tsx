import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { BedDouble, Bath, DollarSign, Tag, Trash2, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { StatusPill } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useUpdateUnitMutation, useDeleteUnitMutation } from '@/store/api/unitApi';
import { useUploadMultipleImagesMutation } from '@/store/api/uploadApi';
import type { Unit } from '@/types/building';

interface FormValues {
  title: string;
  description: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  status: string;
  amenities: string;
}

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'under maintenance', label: 'Under maintenance' },
];

export function RoomDetailDrawer({ unit, open, onClose }: { unit: Unit | null; open: boolean; onClose: () => void }) {
  const [updateUnit, { isLoading: saving }] = useUpdateUnitMutation();
  const [deleteUnit, { isLoading: deleting }] = useDeleteUnitMutation();
  const [uploadImages, { isLoading: uploading }] = useUploadMultipleImagesMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<FormValues>();

  useEffect(() => {
    if (unit) {
      reset({
        title: unit.title ?? '',
        description: unit.description ?? '',
        rentAmount: unit.rentAmount,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        status: unit.status,
        amenities: unit.amenities?.join(', ') ?? '',
      });
      setImages(unit.images ?? []);
    }
  }, [unit, reset]);

  if (!unit) return null;

  const onSubmit = async (values: FormValues) => {
    try {
      await updateUnit({
        id: unit._id,
        body: {
          title: values.title,
          description: values.description,
          rentAmount: Number(values.rentAmount),
          bedrooms: Number(values.bedrooms),
          bathrooms: Number(values.bathrooms),
          status: values.status as any,
          amenities: values.amenities.split(',').map((a) => a.trim()).filter(Boolean),
          images,
        },
      }).unwrap();
      toast.success('Room updated.');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not update room.');
    }
  };

  const onDelete = async () => {
    try {
      await deleteUnit({ id: unit._id, buildingId: unit.buildingId }).unwrap();
      toast.success('Room deleted.');
      setConfirmOpen(false);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not delete room.', { description: err?.data?.suggestion });
    }
  };

  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    try {
      const res = await uploadImages({ category: 'units', files }).unwrap();
      setImages((prev) => [...prev, ...res.data.map((f) => f.url)]);
    } catch {
      toast.error('Image upload failed.');
    }
  };

  return (
    <>
      <Drawer open={open} onClose={onClose}>
        <div className="px-6 pb-8 pt-7">
          <div className="mb-1 flex items-center gap-2.5">
            <span className="font-mono text-2xl font-semibold text-ink">{unit.unitNumber}</span>
            <StatusPill status={unit.status} />
          </div>
          <p className="mb-6 text-sm text-ink-faint">Floor {unit.floorNumber}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Room title" placeholder="e.g. Sunny corner studio" {...register('title')} />
            <Textarea label="Description" placeholder="Describe this room for prospective tenants..." {...register('description')} />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Monthly rent" type="number" step="0.01" leftIcon={<DollarSign className="size-4" />} {...register('rentAmount')} />
              <Select label="Status" options={statusOptions} {...register('status')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Bedrooms" type="number" min={0} leftIcon={<BedDouble className="size-4" />} {...register('bedrooms')} />
              <Input label="Bathrooms" type="number" min={0} leftIcon={<Bath className="size-4" />} {...register('bathrooms')} />
            </div>
            <Input label="Amenities" placeholder="AC, Balcony, WiFi (comma separated)" leftIcon={<Tag className="size-4" />} {...register('amenities')} />

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">Photos</label>
              <div className="flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <div key={i} className="relative size-16 overflow-hidden rounded-lg border border-line">
                    <img src={src} alt="" className="size-full object-cover" />
                    <button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} className="absolute right-0.5 top-0.5 rounded-full bg-ink/60 p-0.5 text-white">
                      <Trash2 className="size-2.5" />
                    </button>
                  </div>
                ))}
                <label className="flex size-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line text-ink-faint transition hover:border-crimson-300 hover:text-crimson-500">
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />
                </label>
              </div>
            </div>

            <Button type="submit" loading={saving} disabled={!isDirty && images.length === (unit.images?.length ?? 0)} icon={<Save className="size-4" />} className="mt-2 justify-center">
              Save changes
            </Button>
            <Button type="button" variant="danger" icon={<Trash2 className="size-4" />} className="justify-center" onClick={() => setConfirmOpen(true)}>
              Delete room
            </Button>
          </form>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        loading={deleting}
        title="Delete this room?"
        description="This can't be undone. Occupied or reserved rooms can't be deleted."
        confirmLabel="Delete room"
      />
    </>
  );
}
