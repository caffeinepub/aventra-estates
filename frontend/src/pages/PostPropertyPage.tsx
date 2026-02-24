import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateProperty } from '@/hooks/useQueries';
import { PropertyType, BhkType, Amenity } from '@/backend';
import { ExternalBlob } from '@/backend';
import { Upload, X, ImageIcon, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

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

const STEPS = ['Basic Info', 'Property Details', 'Features & Photos', 'Review'];

export default function PostPropertyPage() {
  const navigate = useNavigate();
  const createProperty = useCreateProperty();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
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

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handleChange = (field: string, value: string | boolean | Amenity[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...photoFiles, ...files];
    setPhotoFiles(newFiles);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: Amenity) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async () => {
    if (!form.propertyType || !form.bhkType) return;

    // Convert files to ExternalBlob instances
    const imageBlobs: ExternalBlob[] = await Promise.all(
      photoFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return ExternalBlob.fromBytes(new Uint8Array(arrayBuffer));
      })
    );

    await createProperty.mutateAsync({
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
      isFeatured: false,
      hasBalcony: form.hasBalcony,
      parkingSpaces: BigInt(parseInt(form.parkingSpaces) || 0),
      amenities: form.amenities,
      photos: [],
      images: imageBlobs,
    });

    navigate({ to: '/dashboard' });
  };

  const canProceed = () => {
    if (step === 0) return form.title && form.description && form.price && form.location;
    if (step === 1) return form.propertyType && form.bhkType && form.carpetArea && form.builtUpArea;
    return true;
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Post Your Property</h1>
          <p className="text-muted-foreground">Fill in the details to list your property</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                i < step ? 'bg-primary text-primary-foreground' :
                i === step ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:block ${i === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${i < step ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
              <div>
                <Label htmlFor="title">Property Title</Label>
                <Input id="title" className="mt-1" placeholder="e.g. Spacious 3BHK in Baner" value={form.title} onChange={e => handleChange('title', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" className="mt-1" rows={4} placeholder="Describe your property..." value={form.description} onChange={e => handleChange('description', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" className="mt-1" type="number" placeholder="e.g. 5000000" value={form.price} onChange={e => handleChange('price', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" className="mt-1" placeholder="e.g. Baner, Pune" value={form.location} onChange={e => handleChange('location', e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <Switch id="isLuxury" checked={form.isLuxury} onCheckedChange={v => handleChange('isLuxury', v)} />
                <Label htmlFor="isLuxury">Mark as Luxury Property</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="isUnderConstruction" checked={form.isUnderConstruction} onCheckedChange={v => handleChange('isUnderConstruction', v)} />
                <Label htmlFor="isUnderConstruction">Under Construction</Label>
              </div>
            </div>
          )}

          {/* Step 1: Property Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-foreground">Property Details</h2>
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
                  <Input id="carpetArea" className="mt-1" type="number" placeholder="e.g. 1200" value={form.carpetArea} onChange={e => handleChange('carpetArea', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="builtUpArea">Built-up Area (sq ft)</Label>
                  <Input id="builtUpArea" className="mt-1" type="number" placeholder="e.g. 1400" value={form.builtUpArea} onChange={e => handleChange('builtUpArea', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Features & Photos */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-foreground">Features & Photos</h2>

              {/* Balcony & Parking */}
              <div className="flex items-center gap-3">
                <Switch id="hasBalcony" checked={form.hasBalcony} onCheckedChange={v => handleChange('hasBalcony', v)} />
                <Label htmlFor="hasBalcony">Has Balcony</Label>
              </div>
              <div>
                <Label htmlFor="parkingSpaces">Car Parking Spots</Label>
                <Input id="parkingSpaces" className="mt-1" type="number" min="0" placeholder="0" value={form.parkingSpaces} onChange={e => handleChange('parkingSpaces', e.target.value)} />
              </div>

              {/* Amenities */}
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

              {/* Photo Upload */}
              <div>
                <Label className="mb-2 block">Property Photos (JPEG)</Label>
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

                {/* Previews */}
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden aspect-square border border-border">
                        <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
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
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Review Your Listing</h2>
              <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Title</span><span className="font-medium">{form.title}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-medium">₹{parseInt(form.price || '0').toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="font-medium">{form.location}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium">{form.propertyType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">BHK</span><span className="font-medium">{form.bhkType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Carpet Area</span><span className="font-medium">{form.carpetArea} sq ft</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Balcony</span><span className="font-medium">{form.hasBalcony ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Parking</span><span className="font-medium">{form.parkingSpaces} spots</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Photos</span><span className="font-medium">{photoFiles.length} uploaded</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amenities</span><span className="font-medium">{form.amenities.length} selected</span></div>
              </div>
              <p className="text-xs text-muted-foreground">Your listing will be reviewed by our team before going live.</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={createProperty.isPending}>
                {createProperty.isPending ? (
                  <span className="flex items-center gap-2"><Upload className="w-4 h-4 animate-spin" /> Submitting...</span>
                ) : 'Submit Listing'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
