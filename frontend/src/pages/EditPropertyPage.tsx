import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetProperty, useUpdateProperty } from '@/hooks/useQueries';
import { PropertyType, BhkType, Amenity } from '@/backend';
import { ExternalBlob } from '@/backend';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';

const AMENITY_OPTIONS: { value: Amenity; label: string }[] = [
  { value: Amenity.gym, label: 'Gym' },
  { value: Amenity.swimmingPool, label: 'Swimming Pool' },
  { value: Amenity.balcony, label: 'Balcony' },
  { value: Amenity.club, label: 'Club House' },
  { value: Amenity.lift, label: 'Lift' },
  { value: Amenity.garden, label: 'Garden' },
  { value: Amenity.security, label: '24/7 Security' },
  { value: Amenity.powerBackup, label: 'Power Backup' },
  { value: Amenity.playground, label: 'Playground' },
  { value: Amenity.parking, label: 'Parking' },
  { value: Amenity.gardenArea, label: 'Garden Area' },
];

export default function EditPropertyPage() {
  // Route is /edit-property/$id — param name is "id"
  const { id } = useParams({ from: '/edit-property/$id' });
  const navigate = useNavigate();
  const updateProperty = useUpdateProperty();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: property, isLoading } = useGetProperty(BigInt(id));

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    propertyType: '' as PropertyType | '',
    bhkType: '' as BhkType | '',
    carpetArea: '',
    builtUpArea: '',
    isLuxury: false,
    isUnderConstruction: false,
    hasBalcony: false,
    parkingSpaces: '0',
    amenities: [] as Amenity[],
  });

  // Existing images from the backend (ExternalBlob[])
  const [existingImages, setExistingImages] = useState<ExternalBlob[]>([]);
  // New files selected by the user
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (property) {
      setForm({
        title: property.title,
        description: property.description,
        price: property.price.toString(),
        location: property.location,
        propertyType: property.propertyType,
        bhkType: property.bhkType,
        carpetArea: property.carpetArea.toString(),
        builtUpArea: property.builtUpArea.toString(),
        isLuxury: property.isLuxury,
        isUnderConstruction: property.isUnderConstruction,
        hasBalcony: property.hasBalcony,
        parkingSpaces: property.parkingSpaces.toString(),
        amenities: property.amenities,
      });
      setExistingImages(property.images || []);
    }
  }, [property]);

  const handleChange = (field: string, value: string | boolean | Amenity[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewPhotoFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewPhotoPreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: Amenity) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.propertyType || !form.bhkType) return;

    // Convert new files to ExternalBlob instances
    const newImageBlobs: ExternalBlob[] = await Promise.all(
      newPhotoFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return ExternalBlob.fromBytes(new Uint8Array(arrayBuffer));
      })
    );

    // Combine existing (not removed) + new
    const allImages = [...existingImages, ...newImageBlobs];

    await updateProperty.mutateAsync({
      id: BigInt(id),
      update: {
        title: form.title,
        description: form.description,
        price: BigInt(Math.round(parseFloat(form.price) || 0)),
        location: form.location,
        propertyType: form.propertyType as PropertyType,
        bhkType: form.bhkType as BhkType,
        carpetArea: BigInt(parseInt(form.carpetArea) || 0),
        builtUpArea: BigInt(parseInt(form.builtUpArea) || 0),
        isLuxury: form.isLuxury,
        isUnderConstruction: form.isUnderConstruction,
        hasBalcony: form.hasBalcony,
        parkingSpaces: BigInt(parseInt(form.parkingSpaces) || 0),
        amenities: form.amenities,
        photos: [],
        images: allImages,
      },
    });

    navigate({ to: '/dashboard' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit Property</h1>
          <p className="text-muted-foreground">Update your property listing details</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Basic Information</h2>
            <div>
              <Label htmlFor="title">Property Title</Label>
              <Input id="title" className="mt-1" value={form.title} onChange={e => handleChange('title', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="mt-1" rows={4} value={form.description} onChange={e => handleChange('description', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" className="mt-1" type="number" value={form.price} onChange={e => handleChange('price', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" className="mt-1" value={form.location} onChange={e => handleChange('location', e.target.value)} required />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="isLuxury" checked={form.isLuxury} onCheckedChange={v => handleChange('isLuxury', v)} />
              <Label htmlFor="isLuxury">Luxury Property</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="isUnderConstruction" checked={form.isUnderConstruction} onCheckedChange={v => handleChange('isUnderConstruction', v)} />
              <Label htmlFor="isUnderConstruction">Under Construction</Label>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Property Details</h2>
            <div>
              <Label>Property Type</Label>
              <Select value={form.propertyType} onValueChange={v => handleChange('propertyType', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
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
              <Label>BHK Type</Label>
              <Select value={form.bhkType} onValueChange={v => handleChange('bhkType', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select BHK" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BhkType.bhk1}>1 BHK</SelectItem>
                  <SelectItem value={BhkType.bhk2}>2 BHK</SelectItem>
                  <SelectItem value={BhkType.bhk3}>3 BHK</SelectItem>
                  <SelectItem value={BhkType.bhk4}>4 BHK</SelectItem>
                  <SelectItem value={BhkType.bhk5plus}>5+ BHK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="carpetArea">Carpet Area (sq ft)</Label>
                <Input id="carpetArea" className="mt-1" type="number" value={form.carpetArea} onChange={e => handleChange('carpetArea', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="builtUpArea">Built-up Area (sq ft)</Label>
                <Input id="builtUpArea" className="mt-1" type="number" value={form.builtUpArea} onChange={e => handleChange('builtUpArea', e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Features</h2>
            <div className="flex items-center gap-3">
              <Switch id="hasBalcony" checked={form.hasBalcony} onCheckedChange={v => handleChange('hasBalcony', v)} />
              <Label htmlFor="hasBalcony">Has Balcony</Label>
            </div>
            <div>
              <Label htmlFor="parkingSpaces">Car Parking Spots</Label>
              <Input id="parkingSpaces" className="mt-1" type="number" min="0" value={form.parkingSpaces} onChange={e => handleChange('parkingSpaces', e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block">Amenities</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITY_OPTIONS.map(opt => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`amenity-${opt.value}`}
                      checked={form.amenities.includes(opt.value)}
                      onCheckedChange={() => toggleAmenity(opt.value)}
                    />
                    <Label htmlFor={`amenity-${opt.value}`} className="font-normal cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Property Photos</h2>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Photos</p>
                <div className="grid grid-cols-3 gap-3">
                  {existingImages.map((img, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden aspect-square border border-border">
                      <img
                        src={img.getDirectURL()}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/generated/luxury-interior.dim_800x600.png'; }}
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload new photos */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Add New Photos (JPEG)</p>
              <div
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload JPEG photos</p>
                <p className="text-xs text-muted-foreground mt-1">Multiple files supported</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* New photo previews */}
              {newPhotoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {newPhotoPreviews.map((src, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden aspect-square border border-border">
                      <img src={src} alt={`New photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewPhoto(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: '/dashboard' })} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={updateProperty.isPending} className="flex-1">
              {updateProperty.isPending ? (
                <span className="flex items-center gap-2"><Upload className="w-4 h-4 animate-spin" /> Saving...</span>
              ) : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
