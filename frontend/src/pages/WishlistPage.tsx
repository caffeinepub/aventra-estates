import React from 'react';
import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetWishlist, useGetProperty, useRemoveFromWishlist } from '../hooks/useQueries';
import { Heart, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import PropertyCard from '../components/PropertyCard';

function WishlistPropertyItem({ propertyId, onRemove }: { propertyId: bigint; onRemove: (id: bigint) => void }) {
  const { data: property, isLoading } = useGetProperty(propertyId);
  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;
  if (!property) return null;
  return (
    <PropertyCard
      property={property}
      isWishlisted={true}
      onWishlistToggle={onRemove}
      showWishlist={true}
    />
  );
}

export default function WishlistPage() {
  const { identity } = useInternetIdentity();
  const { data: wishlist, isLoading } = useGetWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  if (!identity) return <AccessDeniedScreen />;

  const handleRemove = async (id: bigint) => {
    try {
      await removeFromWishlist.mutateAsync(id);
      toast.success('Removed from wishlist.');
    } catch {
      toast.error('Failed to remove from wishlist.');
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
            <Heart size={18} className="text-obsidian" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">My Wishlist</h1>
            <p className="text-muted-foreground text-sm">
              {isLoading ? 'Loading...' : `${wishlist?.length ?? 0} saved properties`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : !wishlist || wishlist.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <Heart size={56} className="text-gold/30 mx-auto mb-4" />
            <p className="font-serif text-xl text-muted-foreground mb-2">Your wishlist is empty</p>
            <p className="text-sm text-muted-foreground mb-6">Save properties you love to revisit them later.</p>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 gold-gradient text-obsidian font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-all text-sm"
            >
              Browse Properties <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((id) => (
              <WishlistPropertyItem key={id.toString()} propertyId={id} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
