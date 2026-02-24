import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FilterState {
  location: string;
  propertyType: string;
  bhkType: string;
  priceMin: number;
  priceMax: number;
  isFeatured: boolean;
  isLuxury: boolean;
  isUnderConstruction: boolean;
  listingType: 'all' | 'sale' | 'rent';
}

interface PropertyListingFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
}

const PROPERTY_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'rowHouse', label: 'Row House' },
  { value: 'plot', label: 'Plot' },
  { value: 'commercial', label: 'Commercial' },
];

const BHK_TYPES = [
  { value: 'all', label: 'All BHK' },
  { value: 'bhk1', label: '1 BHK' },
  { value: 'bhk2', label: '2 BHK' },
  { value: 'bhk3', label: '3 BHK' },
  { value: 'bhk4', label: '4 BHK' },
  { value: 'bhk5plus', label: '5+ BHK' },
];

const MAX_PRICE = 50000000;

function formatPriceLabel(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
  return `₹${val.toLocaleString('en-IN')}`;
}

export default function PropertyListingFilters({
  filters,
  onFiltersChange,
  onReset,
}: PropertyListingFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (partial: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">Filters</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-xs text-muted-foreground h-7">
          Reset All
        </Button>
      </div>

      {/* Listing Type */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">Listing Type</Label>
        <RadioGroup
          value={filters.listingType}
          onValueChange={(val) => update({ listingType: val as 'all' | 'sale' | 'rent' })}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="all" id="lt-all" />
            <Label htmlFor="lt-all" className="text-sm cursor-pointer">All Listings</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="sale" id="lt-sale" />
            <Label htmlFor="lt-sale" className="text-sm cursor-pointer">For Sale</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="rent" id="lt-rent" />
            <Label htmlFor="lt-rent" className="text-sm cursor-pointer">For Rent</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Location */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">Location</Label>
        <input
          type="text"
          placeholder="Search location..."
          value={filters.location}
          onChange={(e) => update({ location: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Property Type */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">Property Type</Label>
        <Select value={filters.propertyType} onValueChange={(val) => update({ propertyType: val })}>
          <SelectTrigger className="w-full text-sm">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* BHK Type */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">BHK Type</Label>
        <Select value={filters.bhkType} onValueChange={(val) => update({ bhkType: val })}>
          <SelectTrigger className="w-full text-sm">
            <SelectValue placeholder="Select BHK" />
          </SelectTrigger>
          <SelectContent>
            {BHK_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Price Range
          <span className="ml-2 text-xs text-muted-foreground font-normal">
            {formatPriceLabel(filters.priceMin)} – {formatPriceLabel(filters.priceMax)}
          </span>
        </Label>
        <Slider
          min={0}
          max={MAX_PRICE}
          step={100000}
          value={[filters.priceMin, filters.priceMax]}
          onValueChange={([min, max]) => update({ priceMin: min, priceMax: max })}
          className="mt-2"
        />
      </div>

      {/* Flags */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">Property Flags</Label>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Checkbox
              id="featured"
              checked={filters.isFeatured}
              onCheckedChange={(checked) => update({ isFeatured: !!checked })}
            />
            <Label htmlFor="featured" className="text-sm cursor-pointer">Featured</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="luxury"
              checked={filters.isLuxury}
              onCheckedChange={(checked) => update({ isLuxury: !!checked })}
            />
            <Label htmlFor="luxury" className="text-sm cursor-pointer">Luxury</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="underConstruction"
              checked={filters.isUnderConstruction}
              onCheckedChange={(checked) => update({ isUnderConstruction: !!checked })}
            />
            <Label htmlFor="underConstruction" className="text-sm cursor-pointer">Under Construction</Label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {mobileOpen && <X className="h-3.5 w-3.5 ml-1" />}
        </Button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block bg-card border border-border rounded-xl p-5 sticky top-24">
        {filterContent}
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="lg:hidden bg-card border border-border rounded-xl p-5 mb-4">
          {filterContent}
        </div>
      )}
    </>
  );
}
