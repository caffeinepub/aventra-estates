import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ChevronRight, ChevronLeft, Check, Home, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateProperty } from '@/hooks/useQueries';
import { ListingStatus, PropertyType, BhkType } from '@/backend';
import { toast } from 'sonner';

interface FormData {
  title: string;
  description: string;
  price: string;
  location: string;
  propertyType: string;
  bhkType: string;
  carpetArea: string;
  builtUpArea: string;
  listingType: 'sale' | 'rent';
  isFeatured: boolean;
  isLuxury: boolean;
  isUnderConstruction: boolean;
}

const INITIAL_FORM: FormData = {
  title: '',
  description: '',
  price: '',
  location: '',
  propertyType: '',
  bhkType: '',
  carpetArea: '',
  builtUpArea: '',
  listingType: 'sale',
  isFeatured: false,
  isLuxury: false,
  isUnderConstruction: false,
};

const STEPS = ['Basic Info', 'Property Details', 'Features', 'Review'];

export default function PostPropertyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const createProperty = useCreateProperty();

  const update = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 0) return form.title && form.location && form.price && form.listingType;
    if (step === 1) return form.propertyType && form.bhkType && form.carpetArea && form.builtUpArea;
    return true;
  };

  const handleSubmit = async () => {
    try {
      const status =
        form.listingType === 'rent' ? ListingStatus.rent : ListingStatus.pending;

      await createProperty.mutateAsync({
        title: form.title,
        description: form.description,
        price: BigInt(Math.round(Number(form.price))),
        location: form.location,
        propertyType: form.propertyType as PropertyType,
        bhkType: form.bhkType as BhkType,
        carpetArea: BigInt(Math.round(Number(form.carpetArea))),
        builtUpArea: BigInt(Math.round(Number(form.builtUpArea))),
        status,
        isFeatured: form.isFeatured,
        isLuxury: form.isLuxury,
        isUnderConstruction: form.isUnderConstruction,
      });

      toast.success('Property submitted successfully!');
      navigate({ to: '/dashboard' });
    } catch (err: unknown) {
      toast.error('Failed to submit property. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-2">
            <Home className="h-4 w-4" />
            <span>/</span>
            <span>Post Property</span>
          </div>
          <h1 className="text-3xl font-bold">List Your Property</h1>
          <p className="text-primary-foreground/70 mt-1">
            Fill in the details to list your property on Aventra Estates
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    i < step
                      ? 'bg-primary text-primary-foreground'
                      : i === step
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className="text-xs mt-1 text-muted-foreground hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-12 sm:w-20 mx-1 transition-colors ${
                    i < step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-card-foreground">Basic Information</h2>

              {/* Listing Type */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Listing Type *</Label>
                <RadioGroup
                  value={form.listingType}
                  onValueChange={(val) => update('listingType', val)}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="sale" id="lt-sale" />
                    <Label htmlFor="lt-sale" className="cursor-pointer font-normal">
                      For Sale
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="rent" id="lt-rent" />
                    <Label htmlFor="lt-rent" className="cursor-pointer font-normal">
                      For Rent
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="title" className="text-sm font-medium mb-1.5 block">
                  Property Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Spacious 3 BHK Apartment in Kondhwa"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-sm font-medium mb-1.5 block">
                  Location *
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Kondhwa, Pune"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="price" className="text-sm font-medium mb-1.5 block">
                  {form.listingType === 'rent' ? 'Monthly Rent (₹) *' : 'Price (₹) *'}
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder={form.listingType === 'rent' ? 'e.g. 25000' : 'e.g. 5000000'}
                  value={form.price}
                  onChange={(e) => update('price', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium mb-1.5 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property..."
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 1: Property Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-card-foreground">Property Details</h2>

              <div>
                <Label className="text-sm font-medium mb-1.5 block">Property Type *</Label>
                <Select value={form.propertyType} onValueChange={(v) => update('propertyType', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="rowHouse">Row House</SelectItem>
                    <SelectItem value="plot">Plot</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-1.5 block">BHK Type *</Label>
                <Select value={form.bhkType} onValueChange={(v) => update('bhkType', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select BHK type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bhk1">1 BHK</SelectItem>
                    <SelectItem value="bhk2">2 BHK</SelectItem>
                    <SelectItem value="bhk3">3 BHK</SelectItem>
                    <SelectItem value="bhk4">4 BHK</SelectItem>
                    <SelectItem value="bhk5plus">5+ BHK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carpetArea" className="text-sm font-medium mb-1.5 block">
                    Carpet Area (sq.ft) *
                  </Label>
                  <Input
                    id="carpetArea"
                    type="number"
                    placeholder="e.g. 1200"
                    value={form.carpetArea}
                    onChange={(e) => update('carpetArea', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="builtUpArea" className="text-sm font-medium mb-1.5 block">
                    Built-up Area (sq.ft) *
                  </Label>
                  <Input
                    id="builtUpArea"
                    type="number"
                    placeholder="e.g. 1400"
                    value={form.builtUpArea}
                    onChange={(e) => update('builtUpArea', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Features */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-card-foreground">Property Features</h2>
              <p className="text-sm text-muted-foreground">
                Select any special features that apply to your property.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <Checkbox
                    id="featured"
                    checked={form.isFeatured}
                    onCheckedChange={(c) => update('isFeatured', !!c)}
                  />
                  <div>
                    <Label htmlFor="featured" className="cursor-pointer font-medium">
                      Featured Listing
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Highlight your property on the homepage
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <Checkbox
                    id="luxury"
                    checked={form.isLuxury}
                    onCheckedChange={(c) => update('isLuxury', !!c)}
                  />
                  <div>
                    <Label htmlFor="luxury" className="cursor-pointer font-medium">
                      Luxury Property
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Mark as a premium luxury listing
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <Checkbox
                    id="underConstruction"
                    checked={form.isUnderConstruction}
                    onCheckedChange={(c) => update('isUnderConstruction', !!c)}
                  />
                  <div>
                    <Label htmlFor="underConstruction" className="cursor-pointer font-medium">
                      Under Construction
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Property is currently being built
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-card-foreground">Review & Submit</h2>
              <p className="text-sm text-muted-foreground">
                Please review your property details before submitting.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listing Type</span>
                  <span className="font-medium capitalize">
                    {form.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title</span>
                  <span className="font-medium text-right max-w-xs">{form.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{form.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {form.listingType === 'rent' ? 'Monthly Rent' : 'Price'}
                  </span>
                  <span className="font-medium">
                    ₹{Number(form.price).toLocaleString('en-IN')}
                    {form.listingType === 'rent' && '/mo'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Type</span>
                  <span className="font-medium capitalize">{form.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BHK</span>
                  <span className="font-medium">{form.bhkType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carpet Area</span>
                  <span className="font-medium">{form.carpetArea} sq.ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Built-up Area</span>
                  <span className="font-medium">{form.builtUpArea} sq.ft</span>
                </div>
                {(form.isFeatured || form.isLuxury || form.isUnderConstruction) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flags</span>
                    <span className="font-medium">
                      {[
                        form.isFeatured && 'Featured',
                        form.isLuxury && 'Luxury',
                        form.isUnderConstruction && 'Under Construction',
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-sm text-accent-foreground">
                <Building2 className="h-4 w-4 inline mr-1.5 text-accent" />
                Your listing will be reviewed by our team before going live.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => (step === 0 ? navigate({ to: '/' }) : setStep(step - 1))}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="gap-1.5"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createProperty.isPending}
                className="gap-1.5"
              >
                {createProperty.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Submit Property
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
