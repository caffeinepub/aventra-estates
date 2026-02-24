import { useState, useMemo, useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import { Search, SortAsc, SortDesc, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PropertyCard from '@/components/PropertyCard';
import PropertyListingFilters, { FilterState } from '@/components/PropertyListingFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProperties } from '@/hooks/useQueries';
import { ListingStatus } from '@/backend';

const DEFAULT_FILTERS: FilterState = {
  location: '',
  propertyType: 'all',
  bhkType: 'all',
  priceMin: 0,
  priceMax: 50000000,
  isFeatured: false,
  isLuxury: false,
  isUnderConstruction: false,
  listingType: 'all',
};

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'location';

export default function PropertyListingPage() {
  const searchParams = useSearch({ strict: false }) as Record<string, string>;
  const listingTypeParam = searchParams?.listingType as 'all' | 'sale' | 'rent' | undefined;

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    listingType: listingTypeParam === 'rent' ? 'rent' : listingTypeParam === 'sale' ? 'sale' : 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  // Sync listingType filter when URL param changes
  useEffect(() => {
    if (listingTypeParam) {
      setFilters((prev) => ({
        ...prev,
        listingType: listingTypeParam === 'rent' ? 'rent' : listingTypeParam === 'sale' ? 'sale' : 'all',
      }));
    }
  }, [listingTypeParam]);

  const { data: properties = [], isLoading } = useGetProperties();

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Filter by listing type
    if (filters.listingType === 'rent') {
      result = result.filter((p) => p.status === ListingStatus.rent);
    } else if (filters.listingType === 'sale') {
      result = result.filter((p) => p.status === ListingStatus.active);
    } else {
      // Show active and rent (exclude pending/sold from public listing)
      result = result.filter(
        (p) => p.status === ListingStatus.active || p.status === ListingStatus.rent
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Filter by location
    if (filters.location.trim()) {
      const loc = filters.location.toLowerCase();
      result = result.filter((p) => p.location.toLowerCase().includes(loc));
    }

    // Filter by property type
    if (filters.propertyType !== 'all') {
      result = result.filter((p) => p.propertyType === filters.propertyType);
    }

    // Filter by BHK type
    if (filters.bhkType !== 'all') {
      result = result.filter((p) => p.bhkType === filters.bhkType);
    }

    // Filter by price range
    result = result.filter(
      (p) => Number(p.price) >= filters.priceMin && Number(p.price) <= filters.priceMax
    );

    // Filter by flags
    if (filters.isFeatured) result = result.filter((p) => p.isFeatured);
    if (filters.isLuxury) result = result.filter((p) => p.isLuxury);
    if (filters.isUnderConstruction) result = result.filter((p) => p.isUnderConstruction);

    // Sort
    if (sortOption === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortOption === 'location') {
      result.sort((a, b) => a.location.localeCompare(b.location));
    }

    return result;
  }, [properties, filters, searchQuery, sortOption]);

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
    setSortOption('default');
  };

  const pageTitle =
    filters.listingType === 'rent'
      ? 'Properties For Rent'
      : filters.listingType === 'sale'
      ? 'Properties For Sale'
      : 'All Properties';

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-primary text-primary-foreground py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-2">
            <Home className="h-4 w-4" />
            <span>/</span>
            <span>Properties</span>
            {filters.listingType !== 'all' && (
              <>
                <span>/</span>
                <span className="capitalize">{filters.listingType === 'rent' ? 'For Rent' : 'For Sale'}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          <p className="text-primary-foreground/70 mt-1">
            {isLoading ? 'Loading...' : `${filteredProperties.length} properties found`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-asc">
                <span className="flex items-center gap-1.5">
                  <SortAsc className="h-3.5 w-3.5" /> Price: Low to High
                </span>
              </SelectItem>
              <SelectItem value="price-desc">
                <span className="flex items-center gap-1.5">
                  <SortDesc className="h-3.5 w-3.5" /> Price: High to Low
                </span>
              </SelectItem>
              <SelectItem value="location">Location A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="w-64 shrink-0">
            <PropertyListingFilters
              filters={filters}
              onFiltersChange={setFilters}
              onReset={handleReset}
            />
          </aside>

          {/* Property Grid */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-border">
                    <Skeleton className="h-52 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Home className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No properties found</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Try adjusting your filters or search query.
                </p>
                <Button variant="outline" onClick={handleReset}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProperties.map((property) => (
                  <PropertyCard key={String(property.id)} property={property} showWishlist />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
