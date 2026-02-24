import { useState } from 'react';
import { Heart, MapPin, Maximize2, BedDouble, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property, ListingStatus } from '@/backend';
import { useNavigate } from '@tanstack/react-router';

interface PropertyCardProps {
  property: Property;
  isWishlisted?: boolean;
  onWishlistToggle?: (id: bigint) => void;
  showWishlist?: boolean;
}

const BHK_LABELS: Record<string, string> = {
  bhk1: '1 BHK',
  bhk2: '2 BHK',
  bhk3: '3 BHK',
  bhk4: '4 BHK',
  bhk5plus: '5+ BHK',
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  villa: 'Villa',
  rowHouse: 'Row House',
  plot: 'Plot',
  commercial: 'Commercial',
};

function formatPrice(price: bigint): string {
  const num = Number(price);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

export default function PropertyCard({
  property,
  isWishlisted = false,
  onWishlistToggle,
  showWishlist = false,
}: PropertyCardProps) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const imageUrl =
    !imgError && property.images && property.images.length > 0
      ? property.images[0].getDirectURL()
      : null;

  const isRent = property.status === ListingStatus.rent;
  const whatsappNumber = '917020271267';
  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in the property: ${property.title} (ID: ${property.id}). Please share more details.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div
      className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer border border-border/50"
      onClick={() => navigate({ to: `/properties/${property.id}` })}
    >
      {/* Image */}
      <div className="relative h-52 bg-muted overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <img
              src="/assets/generated/luxury-interior.dim_800x600.png"
              alt="Property"
              className="w-full h-full object-cover opacity-60"
            />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {property.isFeatured && (
            <Badge className="bg-accent text-accent-foreground text-xs font-semibold px-2 py-0.5">
              Featured
            </Badge>
          )}
          {property.isLuxury && (
            <Badge className="bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-0.5">
              Luxury
            </Badge>
          )}
          {isRent && (
            <Badge className="bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5">
              For Rent
            </Badge>
          )}
          {property.isUnderConstruction && (
            <Badge variant="outline" className="bg-background/80 text-xs font-semibold px-2 py-0.5">
              Under Construction
            </Badge>
          )}
        </div>

        {/* Wishlist */}
        {showWishlist && onWishlistToggle && (
          <button
            className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onWishlistToggle(property.id);
            }}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`}
            />
          </button>
        )}

        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-lg shadow">
            {formatPrice(property.price)}
            {isRent && <span className="text-xs font-normal opacity-80">/mo</span>}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-card-foreground text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          <span className="text-xs text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded-full">
            {PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}
          </span>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground border-t border-border/50 pt-3">
          <div className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" />
            <span>{BHK_LABELS[property.bhkType] || property.bhkType}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize2 className="h-3.5 w-3.5" />
            <span>{Number(property.carpetArea)} sq.ft</span>
          </div>
          <div className="ml-auto">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={(e) => {
                e.stopPropagation();
                window.open(whatsappUrl, '_blank');
              }}
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
