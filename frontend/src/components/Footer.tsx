import { MapPin, Phone, Mail, Building2, Heart } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'aventra-estates');

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-7 w-7 text-accent" />
              <span className="text-xl font-bold tracking-tight">Aventra Estates</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Your trusted partner in finding the perfect property. Buy, sell, or rent with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-accent">Quick Links</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="/" className="hover:text-accent transition-colors">Home</a></li>
              <li><a href="/properties" className="hover:text-accent transition-colors">Properties</a></li>
              <li><a href="/properties?listingType=rent" className="hover:text-accent transition-colors">For Rent</a></li>
              <li><a href="/post-property" className="hover:text-accent transition-colors">Post Property</a></li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-accent">Property Types</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>Apartments</li>
              <li>Villas</li>
              <li>Row Houses</li>
              <li>Plots</li>
              <li>Commercial</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-accent">Contact Us</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+917020271267" className="hover:text-accent transition-colors">+91 70202 71267</a>
                  <a href="tel:+919535511171" className="hover:text-accent transition-colors">+91 95355 11171</a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                <a href="mailto:aventraestate@gmail.com" className="hover:text-accent transition-colors break-all">
                  aventraestate@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                <span>Near Goodluck Apartment, Kondhwa, Pune 411048</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-primary-foreground/60">
          <p>© {year} Aventra Estates. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3.5 w-3.5 fill-accent text-accent" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
