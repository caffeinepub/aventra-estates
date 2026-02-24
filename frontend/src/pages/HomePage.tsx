import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturedProperties from '../components/FeaturedProperties';
import UnderConstructionProjects from '../components/UnderConstructionProjects';
import LuxuryCollection from '../components/LuxuryCollection';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Building2, MapPin, TrendingUp, Shield } from 'lucide-react';

const PUNE_LOCALITIES = [
  { name: 'Kondhwa', count: '120+' },
  { name: 'Undri', count: '85+' },
  { name: 'NIBM', count: '95+' },
  { name: 'Wanowrie', count: '110+' },
  { name: 'Baner', count: '200+' },
  { name: 'Kothrud', count: '150+' },
];

const WHY_US = [
  { icon: Building2, title: 'Premium Listings', desc: 'Curated selection of verified premium properties across Pune.' },
  { icon: Shield, title: 'Trusted & Verified', desc: 'Every listing is verified by our expert team for authenticity.' },
  { icon: TrendingUp, title: 'Best Value', desc: 'Competitive pricing with transparent deals and no hidden charges.' },
  { icon: MapPin, title: 'Local Expertise', desc: 'Deep knowledge of Pune\'s real estate market and localities.' },
];

export default function HomePage() {
  return (
    <div>
      <HeroSection />

      {/* Why Choose Us */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-2">Why Aventra Estates</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Your Trusted Property Partner</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-xl border border-border bg-card hover:border-gold/40 transition-colors group">
                <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={24} className="text-obsidian" />
                </div>
                <h3 className="font-serif font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider mx-8" />

      <FeaturedProperties />

      <div className="section-divider mx-8" />

      <UnderConstructionProjects />

      <LuxuryCollection />

      {/* Browse by Locality */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-2">Explore Pune</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Browse by Locality</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {PUNE_LOCALITIES.map(({ name, count }) => (
              <Link
                key={name}
                to="/properties"
                search={{ location: name } as Record<string, string>}
                className="group flex flex-col items-center p-5 rounded-xl border border-border bg-card hover:border-gold hover:bg-gold/5 transition-all text-center"
              >
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors">
                  <MapPin size={18} className="text-gold" />
                </div>
                <span className="font-semibold text-foreground text-sm">{name}</span>
                <span className="text-muted-foreground text-xs mt-1">{count} Properties</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsCarousel />

      {/* CTA Banner */}
      <section className="py-16 md:py-20 bg-obsidian relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('/assets/generated/featured-bg.dim_1440x600.png')" }}
        />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-ivory mb-4">
            Ready to <span className="gold-text-gradient">List Your Property?</span>
          </h2>
          <p className="text-ivory/60 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Join thousands of property owners who trust Aventra Estates to connect them with the right buyers and tenants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/post-property"
              className="gold-gradient text-obsidian font-semibold px-8 py-4 rounded-full hover:opacity-90 transition-all shadow-gold text-sm sm:text-base inline-flex items-center gap-2"
            >
              Post Property Free <ArrowRight size={16} />
            </Link>
            <Link
              to="/properties"
              className="border border-ivory/30 text-ivory font-semibold px-8 py-4 rounded-full hover:border-gold hover:text-gold transition-all text-sm sm:text-base"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
