import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { useGetFeaturedProperties } from '../hooks/useQueries';
import PropertyCard from './PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedProperties() {
  const { data: properties, isLoading } = useGetFeaturedProperties();

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-2">Handpicked for You</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Featured Properties
            </h2>
          </div>
          <Link
            to="/properties"
            className="flex items-center gap-2 text-gold text-sm font-semibold hover:gap-3 transition-all"
          >
            View All Properties <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <Skeleton className="h-52 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, 6).map((property) => (
              <PropertyCard key={property.id.toString()} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="font-serif text-xl mb-2">No featured properties yet</p>
            <p className="text-sm">Check back soon for our curated selection.</p>
          </div>
        )}
      </div>
    </section>
  );
}
