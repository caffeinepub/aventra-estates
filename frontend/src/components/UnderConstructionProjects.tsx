import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, HardHat, Calendar } from 'lucide-react';
import { useGetProperties } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

function formatPrice(price: bigint): string {
  const n = Number(price);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function UnderConstructionProjects() {
  const { data: allProperties, isLoading } = useGetProperties();
  const projects = allProperties?.filter((p) => p.isUnderConstruction) ?? [];

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-2">New Launches</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Under Construction Projects
            </h2>
          </div>
          <Link
            to="/properties"
            className="flex items-center gap-2 text-gold text-sm font-semibold hover:gap-3 transition-all"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map((project) => {
              const imageUrl = project.images.length > 0 ? project.images[0].getDirectURL() : null;
              return (
                <Link
                  key={project.id.toString()}
                  to="/properties/$id"
                  params={{ id: project.id.toString() }}
                  className="group bg-card rounded-xl border border-border overflow-hidden card-hover block"
                >
                  <div className="relative h-48 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <HardHat size={40} className="text-gold/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0">
                      <HardHat size={11} className="mr-1" /> Under Construction
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-semibold text-foreground text-base mb-1 line-clamp-1 group-hover:text-gold transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-1">{project.location}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-gold text-lg">{formatPrice(project.price)}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar size={12} /> Possession 2026
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <HardHat size={48} className="text-gold/30 mx-auto mb-4" />
            <p className="font-serif text-xl text-muted-foreground mb-2">No projects under construction</p>
            <p className="text-sm text-muted-foreground">New launches coming soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}
