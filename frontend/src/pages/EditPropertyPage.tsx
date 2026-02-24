import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetProperty, useUpdateProperty, useAddAmenities } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { ListingStatus, PropertyType, BhkType, Amenity } from '../backend';
import { Link } from '@tanstack/react-router';

const AMENITY_OPTIONS = [
  { value: Amenity.gym, label: 'Gym' },
  { value: Amenity.swimmingPool, label: 'Swimming Pool' },
  { value: Amenity.parking, label: 'Parking' },
  { value: Amenity.garden, label: 'Garden' },
  { value: Amenity.security, label: '24/7 Security' },
  { value: Amenity.playground, label: 'Playground' },
];

export default function EditPropertyPage() {
  const { id } = useParams({ from: '/edit-property/$id' });
  const propertyId = BigInt(id);
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: property, isLoading } = useGetProperty(propertyId);
  const updateProperty = useUpdateProperty();
  const addAmenities = useAddAmenities();

  const [form, setForm] = useState({
    title: '', description: '', price: '', propertyType: '',
    bhkType: '', location: '', carpetArea: '', builtUpArea: '',
    status: ListingStatus.pending, isLuxury: false, isUnderConstruction: false,
    amenities: [] as Amenity[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (property) {
      setForm({
        title: property.title,
        description: property.description,
        price: property.price.toString(),
        propertyType: property.propertyType,
        bhkType: property.bhkType,
        location: property.location,
        carpetArea: property.carpetArea.toString(),
        builtUpArea: property.builtUpArea.toString(),
        status: property.status,
        isLuxury: property.isLuxury,
        isUnderConstruction: property.isUnderConstruction,
        amenities: [...property.amenities],
      });
    }
  }, [property]);

  if (!identity) return <AccessDeniedScreen />;

  const update = (key: string, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const toggleAmenity = (amenity: Amenity) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.price || isNaN(Number(form.price))) errs.price = 'Valid price is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.carpetArea || isNaN(Number(form.carpetArea))) errs.carpetArea = 'Valid carpet area is required';
    if (!form.builtUpArea || isNaN(Number(form.builtUpArea))) errs.builtUpArea = 'Valid built-up area is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      await updateProperty.mutateAsync({
        id: propertyId,
        update: {
          title: form.title,
          description: form.description,
          price: BigInt(Math.round(Number(form.price))),
          location: form.location,
          propertyType: form.propertyType as PropertyType,
          bhkType: form.bhkType as BhkType,
          carpetArea: BigInt(Math.round(Number(form.carpetArea))),
          builtUpArea: BigInt(Math.round(Number(form.builtUpArea))),
          status: form.status,
          isLuxury: form.isLuxury,
          isUnderConstruction: form.isUnderConstruction,
        },
      });
      await addAmenities.mutateAsync({ propertyId, amenities: form.amenities });
      toast.success('Property updated successfully!');
      navigate({ to: '/dashboard' });
    } catch {
      toast.error('Failed to update property. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 container mx-auto px-4 sm:px-6 py-8 max-w-2xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const isSubmitting = updateProperty.isPending || addAmenities.isPending;

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard" className="p-2 rounded-lg border border-border hover:border-gold hover:text-gold transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Edit Property</h1>
            <p className="text-muted-foreground text-sm">Update your property listing details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-5">
          <div>
            <Label htmlFor="edit-title" className="text-sm mb-1.5 block">Property Title *</Label>
            <Input id="edit-title" value={form.title} onChange={(e) => update('title', e.target.value)}
              className={errors.title ? 'border-destructive' : ''} />
            {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <Label htmlFor="edit-desc" className="text-sm mb-1.5 block">Description</Label>
            <Textarea id="edit-desc" value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-price" className="text-sm mb-1.5 block">Price (₹) *</Label>
              <Input id="edit-price" type="number" value={form.price} onChange={(e) => update('price', e.target.value)}
                className={errors.price ? 'border-destructive' : ''} />
              {errors.price && <p className="text-destructive text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Status</Label>
              <Select value={form.status} onValueChange={(v) => update('status', v as ListingStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ListingStatus.pending}>Pending</SelectItem>
                  <SelectItem value={ListingStatus.active}>Active</SelectItem>
                  <SelectItem value={ListingStatus.sold}>Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="edit-location" className="text-sm mb-1.5 block">Location *</Label>
            <Input id="edit-location" value={form.location} onChange={(e) => update('location', e.target.value)}
              className={errors.location ? 'border-destructive' : ''} />
            {errors.location && <p className="text-destructive text-xs mt-1">{errors.location}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-1.5 block">Property Type</Label>
              <Select value={form.propertyType} onValueChange={(v) => update('propertyType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={PropertyType.apartment}>Apartment</SelectItem>
                  <SelectItem value={PropertyType.villa}>Villa</SelectItem>
                  <SelectItem value={PropertyType.rowHouse}>Row House</SelectItem>
                  <SelectItem value={PropertyType.plot}>Plot</SelectItem>
                  <SelectItem value={PropertyType.commercial}>Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">BHK Type</Label>
              <Select value={form.bhkType} onValueChange={(v) => update('bhkType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={BhkType.bhk1}>1 BHK</SelectItem>
                  <SelectItem value={BhkType.bhk2}>2 BHK</SelectItem>
                  <SelectItem value={BhkType.bhk3}>3 BHK</SelectItem>
                  <SelectItem value={BhkType.bhk4}>4 BHK</SelectItem>
                  <SelectItem value={BhkType.bhk5plus}>5+ BHK</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-carpet" className="text-sm mb-1.5 block">Carpet Area (sq.ft) *</Label>
              <Input id="edit-carpet" type="number" value={form.carpetArea} onChange={(e) => update('carpetArea', e.target.value)}
                className={errors.carpetArea ? 'border-destructive' : ''} />
              {errors.carpetArea && <p className="text-destructive text-xs mt-1">{errors.carpetArea}</p>}
            </div>
            <div>
              <Label htmlFor="edit-builtup" className="text-sm mb-1.5 block">Built-up Area (sq.ft) *</Label>
              <Input id="edit-builtup" type="number" value={form.builtUpArea} onChange={(e) => update('builtUpArea', e.target.value)}
                className={errors.builtUpArea ? 'border-destructive' : ''} />
              {errors.builtUpArea && <p className="text-destructive text-xs mt-1">{errors.builtUpArea}</p>}
            </div>
          </div>
          <div>
            <Label className="text-sm mb-3 block">Amenities</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AMENITY_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-border hover:border-gold/40 transition-colors">
                  <Checkbox checked={form.amenities.includes(value)} onCheckedChange={() => toggleAmenity(value)} />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: 'isLuxury', label: 'Mark as Luxury Property' },
              { key: 'isUnderConstruction', label: 'Under Construction' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={form[key as keyof typeof form] as boolean}
                  onCheckedChange={(v) => update(key, !!v)} />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
          <div className="pt-4 border-t border-border">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full gold-gradient text-obsidian font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <span className="animate-pulse">Saving...</span> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
