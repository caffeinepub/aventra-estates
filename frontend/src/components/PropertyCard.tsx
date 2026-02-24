import { Property } from '@/backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, BedDouble, Maximize2, Heart, MessageCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useQueries';

interface PropertyCardProps {
  property: Property;
  showWishlist?: boolean;
  isWishlisted?: boolean;
  onWishlistToggle?: (id: bigint) => void;
}

const BHK_LABELS: Record<string, string> = {
  bhk1: '1 BHK',
  bhk2: '2 BHK',
  bhk3: '3 BHK',
  bhk4: '4 BHK',
  bhk5plus: '5+ BHK',
};

const PLACEHOLDER = '/assets/generated/luxury-interior.dim_800x600.png';

export default function PropertyCard({ property, showWishlist = false, isWishlisted = false, onWishlistToggle }: PropertyCardProps) {
  const navigate = useNavigate();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  // Use ExternalBlob images, fallback to placeholder
  const imageUrl = property.images && property.images.length > 0
    ? property.images[0].getDirectURL()
    : PLACEHOLDER;

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(property.id);
    } else if (isWishlisted) {
      removeFromWishlist.mutate(property.id);
    } else {
      addToWishlist.mutate(property.id);
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = encodeURIComponent(`Hi, I'm interested in the property: ${property.title} (${property.location})`);
    window.open(`https://wa.me/917020271267?text=${msg}`, '_blank');
  };

  const formatPrice = (price: bigint) => {
    const n = Number(price);
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => navigate({ to: '/properties/$id', params: { id: property.id.toString() } })}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {property.isFeatured && <Badge className="bg-primary text-primary-foreground text-xs">Featured</Badge>}
          {property.isLuxury && <Badge className="bg-amber-500 text-white text-xs">Luxury</Badge>}
          {property.status === 'rent' && <Badge variant="secondary" className="text-xs">For Rent</Badge>}
          {property.isUnderConstruction && <Badge variant="outline" className="bg-card text-xs">Under Construction</Badge>}
        </div>
        {/* Wishlist */}
        {showWishlist && (
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-card transition-colors"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-base line-clamp-1 mb-1">{property.title}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" />
            {BHK_LABELS[property.bhkType] || property.bhkType}
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5" />
            {property.carpetArea.toString()} sq ft
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">{formatPrice(property.price)}</span>
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Enquire
          </Button>
        </div>
      </div>
    </div>
  );
}
