import React, { useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import SearchBar from './SearchBar';

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      {!videoError ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/assets/hero-video.mp4" type="video/mp4" />
        </video>
      ) : null}

      {/* Fallback image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/generated/hero-banner.dim_1920x1080.png')`,
          zIndex: videoError ? 0 : -1,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/40 bg-gold/10 backdrop-blur-sm mb-6 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-gold text-xs font-semibold tracking-widest uppercase">Premium Real Estate</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-ivory leading-tight mb-4 animate-slide-up">
          Find Your{' '}
          <span className="gold-text-gradient">Dream Home</span>
          <br />
          in Pune
        </h1>

        <p className="text-ivory/70 text-base sm:text-lg md:text-xl max-w-2xl mb-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Your Trusted Property Partner
        </p>
        <p className="text-ivory/50 text-sm sm:text-base max-w-xl mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Discover premium apartments, villas, and luxury properties across Kondhwa, Undri, NIBM, Wanowrie & more.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Link
            to="/post-property"
            className="gold-gradient text-obsidian font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-all shadow-gold text-sm sm:text-base"
          >
            Post Property Free
          </Link>
          <Link
            to="/properties"
            className="border border-ivory/40 text-ivory font-semibold px-8 py-3.5 rounded-full hover:border-gold hover:text-gold transition-all text-sm sm:text-base backdrop-blur-sm"
          >
            Browse Properties
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {[
            { value: '5000+', label: 'Properties Listed' },
            { value: '2000+', label: 'Happy Families' },
            { value: '15+', label: 'Years Experience' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-gold">{value}</div>
              <div className="text-ivory/50 text-xs sm:text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <SearchBar />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown size={24} className="text-gold/60" />
      </div>
    </section>
  );
}
