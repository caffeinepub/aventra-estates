import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { useGetTestimonials } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

const FALLBACK_TESTIMONIALS = [
  {
    id: BigInt(1),
    author: 'Priya Sharma',
    quote: 'Aventra Estates helped us find our dream home in Kondhwa. The team was professional, responsive, and made the entire process seamless. Highly recommended!',
    rating: BigInt(5),
  },
  {
    id: BigInt(2),
    author: 'Rajesh Mehta',
    quote: 'Excellent service and a wide range of premium properties. We found our perfect 3BHK in NIBM within just two weeks. The agents were knowledgeable and helpful.',
    rating: BigInt(5),
  },
  {
    id: BigInt(3),
    author: 'Anita Desai',
    quote: 'The luxury collection on Aventra Estates is truly impressive. We purchased a villa in Wanowrie and couldn\'t be happier. World-class service throughout.',
    rating: BigInt(5),
  },
];

export default function TestimonialsCarousel() {
  const { data: testimonials, isLoading } = useGetTestimonials();
  const [current, setCurrent] = useState(0);

  const items = (testimonials && testimonials.length > 0) ? testimonials : FALLBACK_TESTIMONIALS;

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);
  const next = () => setCurrent((c) => (c + 1) % items.length);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-2">What Our Clients Say</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Customer Testimonials
          </h2>
        </div>

        {isLoading ? (
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-card rounded-2xl border border-border p-8 md:p-12 luxury-shadow">
              <Quote size={48} className="text-gold/20 absolute top-6 left-6" />
              <div className="relative z-10">
                {/* Stars */}
                <div className="flex gap-1 mb-6 justify-center">
                  {Array.from({ length: Number(items[current].rating) }).map((_, i) => (
                    <Star key={i} size={18} className="text-gold fill-gold" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="font-serif text-lg md:text-xl text-foreground text-center leading-relaxed mb-8 italic">
                  "{items[current].quote}"
                </blockquote>

                {/* Author */}
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center mx-auto mb-3">
                    <span className="font-serif font-bold text-obsidian text-lg">
                      {items[current].author.charAt(0)}
                    </span>
                  </div>
                  <p className="font-semibold text-foreground">{items[current].author}</p>
                  <p className="text-muted-foreground text-sm">Verified Buyer</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            {items.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-2">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === current ? 'bg-gold w-6' : 'bg-gold/30'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
