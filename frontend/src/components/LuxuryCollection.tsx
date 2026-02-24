import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Star } from 'lucide-react';
import { useGetProperties } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

function formatPrice(price: bigint): string {
  const n = Number(price);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function LuxuryCollection() {
  const { data: allProperties, isLoading } = useGetProperties();
  const luxuryProperties = allProperties?.filter((p) => p.isLuxury) ?? [];

  return (
    <section className="py-16 md:py-24 bg-obsidian relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{ backgroundImage: "url('/assets/generated/luxury-interior.dim_800x600.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/60 to-obsidian/90" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 mb-4">
            <Star size={14} className="text-gold fill-gold" />
            <span className="text-gold text-xs font-semibold uppercase tracking-widest">Exclusive Collection</span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-ivory mb-4">
            Luxury <span className="gold-text-gradient">Collection</span>
          </h2>
          <p className="text-ivory/60 max-w-xl mx-auto text-sm sm:text-base">
            Discover our handpicked selection of ultra-premium properties for the discerning buyer.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 rounded-xl bg-white/10" />
            ))}
          </div>
        ) : luxuryProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {luxuryProperties.slice(0, 6).map((property) => {
              const imageUrl = property.images.length > 0 ? property.images[0].getDirectURL() : null;
              return (
                <Link
                  key={property.id.toString()}
                  to="/properties/$id"
                  params={{ id: property.id.toString() }}
                  className="group relative rounded-xl overflow-hidden h-72 block"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <Star size={48} className="text-gold/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/40 rounded-xl transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-serif font-bold text-ivory text-lg mb-1 line-clamp-1">{property.title}</h3>
                    <p className="text-ivory/60 text-sm mb-2">{property.location}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-gold text-xl">{formatPrice(property.price)}</span>
                      <span className="flex items-center gap-1 text-gold text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full border border-gold/20 mb-6">
              <Star size={48} className="text-gold/40" />
            </div>
            <p className="font-serif text-2xl text-ivory/60 mb-2">Luxury Collection Coming Soon</p>
            <p className="text-ivory/40 text-sm">Our curated luxury properties will be available shortly.</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 border border-gold text-gold px-8 py-3 rounded-full font-semibold hover:bg-gold/10 transition-all text-sm"
          >
            Explore All Luxury Properties <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
