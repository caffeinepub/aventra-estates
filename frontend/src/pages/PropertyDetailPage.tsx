import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import {
  MapPin,
  Maximize2,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Tag,
  Home,
  Loader2,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import AgentCard from '@/components/AgentCard';
import { useGetProperty, useGetUserProfile, useCreateEnquiry } from '@/hooks/useQueries';
import { ListingStatus } from '@/backend';
import { toast } from 'sonner';

const AMENITY_LABELS: Record<string, string> = {
  parking: 'Parking',
  gym: 'Gym',
  swimmingPool: 'Swimming Pool',
  garden: 'Garden',
  security: '24/7 Security',
  playground: 'Playground',
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  villa: 'Villa',
  rowHouse: 'Row House',
  plot: 'Plot',
  commercial: 'Commercial',
};

const BHK_LABELS: Record<string, string> = {
  bhk1: '1 BHK',
  bhk2: '2 BHK',
  bhk3: '3 BHK',
  bhk4: '4 BHK',
  bhk5plus: '5+ BHK',
};

function formatPrice(price: bigint): string {
  const num = Number(price);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

export default function PropertyDetailPage() {
  const { propertyId } = useParams({ strict: false }) as { propertyId: string };
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const { data: property, isLoading: propLoading } = useGetProperty(BigInt(propertyId || '0'));
  const { data: ownerProfile, isLoading: ownerLoading } = useGetUserProfile(
    property?.owner ?? null
  );
  const createEnquiry = useCreateEnquiry();

  const isRent = property?.status === ListingStatus.rent;

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    try {
      await createEnquiry.mutateAsync({
        propertyId: property.id,
        senderName: enquiryForm.name,
        senderPhone: enquiryForm.phone,
        senderEmail: enquiryForm.email,
        message: enquiryForm.message,
        timestamp: BigInt(Date.now()),
      });
      toast.success('Enquiry sent successfully!');
      setEnquiryForm({ name: '', phone: '', email: '', message: '' });
    } catch {
      toast.error('Failed to send enquiry. Please try again.');
    }
  };

  if (propLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-80 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Home className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
          <Button onClick={() => navigate({ to: '/properties' })}>Browse Properties</Button>
        </div>
      </div>
    );
  }

  const images = property.images || [];
  const hasImages = images.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
            <button onClick={() => navigate({ to: '/' })} className="hover:text-primary-foreground transition-colors">
              Home
            </button>
            <span>/</span>
            <button onClick={() => navigate({ to: '/properties' })} className="hover:text-primary-foreground transition-colors">
              Properties
            </button>
            <span>/</span>
            <span className="text-primary-foreground line-clamp-1">{property.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-xl overflow-hidden bg-muted h-80 sm:h-96">
              {hasImages ? (
                <>
                  <img
                    src={images[imgIndex].getDirectURL()}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImgIndex(i)}
                            className={`h-1.5 rounded-full transition-all ${i === imgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <img
                  src="/assets/generated/luxury-interior.dim_800x600.png"
                  alt="Property"
                  className="w-full h-full object-cover opacity-70"
                />
              )}
            </div>

            {/* Title & Price */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  {property.title}
                </h1>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(property.price)}
                    {isRent && <span className="text-base font-normal text-muted-foreground">/mo</span>}
                  </span>
                  {/* Listing Type Badge */}
                  <Badge
                    className={
                      isRent
                        ? 'bg-emerald-600 text-white text-xs'
                        : 'bg-primary text-primary-foreground text-xs'
                    }
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {isRent ? 'For Rent' : 'For Sale'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{property.location}</span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {property.isFeatured && (
                  <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                )}
                {property.isLuxury && (
                  <Badge className="bg-secondary text-secondary-foreground">Luxury</Badge>
                )}
                {property.isUnderConstruction && (
                  <Badge variant="outline">Under Construction</Badge>
                )}
                <Badge variant="outline">
                  {PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}
                </Badge>
                <Badge variant="outline">
                  {BHK_LABELS[property.bhkType] || property.bhkType}
                </Badge>
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <BedDouble className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">BHK</p>
                <p className="font-semibold text-sm">{BHK_LABELS[property.bhkType]}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <Maximize2 className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Carpet Area</p>
                <p className="font-semibold text-sm">{Number(property.carpetArea)} sq.ft</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <Maximize2 className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Built-up Area</p>
                <p className="font-semibold text-sm">{Number(property.builtUpArea)} sq.ft</p>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-semibold text-foreground mb-3">About This Property</h2>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-semibold text-foreground mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-sm">
                      {AMENITY_LABELS[amenity] || amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Enquiry Form */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-4">Send Enquiry</h2>
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="enq-name" className="text-sm mb-1.5 block">
                      Your Name *
                    </Label>
                    <Input
                      id="enq-name"
                      placeholder="Full name"
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="enq-phone" className="text-sm mb-1.5 block">
                      Phone *
                    </Label>
                    <Input
                      id="enq-phone"
                      placeholder="+91 XXXXX XXXXX"
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm((f) => ({ ...f, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="enq-email" className="text-sm mb-1.5 block">
                    Email
                  </Label>
                  <Input
                    id="enq-email"
                    type="email"
                    placeholder="your@email.com"
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="enq-message" className="text-sm mb-1.5 block">
                    Message
                  </Label>
                  <Textarea
                    id="enq-message"
                    placeholder="I'm interested in this property..."
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm((f) => ({ ...f, message: e.target.value }))}
                    rows={3}
                  />
                </div>
                <Button type="submit" disabled={createEnquiry.isPending} className="w-full gap-2">
                  {createEnquiry.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Enquiry
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Price Card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(property.price)}
                  {isRent && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                </span>
                <Badge
                  className={
                    isRent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-primary text-primary-foreground'
                  }
                >
                  {isRent ? 'For Rent' : 'For Sale'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{property.location}</p>
            </div>

            {/* Agent Card */}
            <AgentCard
              name={ownerProfile?.name}
              email={ownerProfile?.email}
              phone={ownerProfile?.phone}
              isLoading={ownerLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
