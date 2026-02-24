import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from '@tanstack/react-router';

type SearchTab = 'buy' | 'rent';

export default function SearchBar() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SearchTab>('buy');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location.trim()) {
      params.set('location', location.trim());
    }
    if (activeTab === 'rent') {
      params.set('listingType', 'rent');
    } else {
      params.set('listingType', 'sale');
    }
    navigate({ to: `/properties?${params.toString()}` });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="bg-card rounded-2xl shadow-xl p-2 max-w-2xl w-full mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 mb-3 px-1 pt-1">
        <button
          onClick={() => setActiveTab('buy')}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'buy'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setActiveTab('rent')}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'rent'
              ? 'bg-emerald-600 text-white'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Rent
        </button>
      </div>

      {/* Search Input */}
      <div className="flex gap-2 px-1 pb-1">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              activeTab === 'rent'
                ? 'Search rental properties by location...'
                : 'Search properties by location...'
            }
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 h-11 text-sm"
          />
        </div>
        <Button
          onClick={handleSearch}
          className={`h-11 px-5 gap-2 ${activeTab === 'rent' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
        >
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  );
}
