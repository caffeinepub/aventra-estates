import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProperty, useGetUserProfile, useCreateEnquiry } from '@/hooks/useQueries';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, BedDouble, Maximize2, Car, Wind, CheckCircle, ArrowLeft } from 'lucide-react';
import ImageGallerySlider from '@/components/ImageGallerySlider';
import AgentCard from '@/components/AgentCard';
import { Amenity } from '@/backend';

const BHK_LABELS: Record<string, string> = {
  bhk1: '1 BHK', bhk2: '2 BHK', bhk3: '3 BHK', bhk4: '4 BHK', bhk5plus: '5+ BHK',
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment', villa: 'Villa', rowHouse: 'Row House', plot: 'Plot', commercial: 'Commercial',
};

const AMENITY_LABELS: Record<string, string> = {
  gym: 'Gym', swimmingPool: 'Swimming Pool', balcony: 'Balcony', club: 'Club House',
  lift: 'Lift', garden: 'Garden', security: '24/7 Security', powerBackup: 'Power Backup',
  playground: 'Playground', parking: 'Parking', gardenArea: 'Garden Area',
};

const formatPrice = (price: bigint) => {
  const n = Number(price);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

export default function PropertyDetailPage() {
  // Route is /properties/$id — param name is "id"
  const { id } = useParams({ from: '/properties/$id' });
  const navigate = useNavigate();
  const { data: property, isLoading } = useGetProperty(BigInt(id));
  // owner can be undefined before property loads; useGetUserProfile accepts null | undefined
  const { data: ownerProfile, isLoading: profileLoading } = useGetUserProfile(property?.owner ?? null);
  const createEnquiry = useCreateEnquiry();

  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [enquirySent, setEnquirySent] = useState(false);

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    await createEnquiry.mutateAsync({
      propertyId: property.id,
      senderName: enquiryForm.name,
      senderPhone: enquiryForm.phone,
      senderEmail: enquiryForm.email,
      message: enquiryForm.message,
      timestamp: BigInt(Date.now()),
    });
    setEnquirySent(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-lg">Property not found.</p>
        <Button className="mt-4" onClick={() => navigate({ to: '/properties' })}>Browse Properties</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate({ to: '/properties' })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Gallery + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery - uses ExternalBlob images only */}
          <ImageGallerySlider images={property.images || []} title={property.title} />

          {/* Title & Badges */}
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {property.isFeatured && <Badge className="bg-primary text-primary-foreground">Featured</Badge>}
              {property.isLuxury && <Badge className="bg-amber-500 text-white">Luxury</Badge>}
              {property.status === 'rent' && <Badge variant="secondary">For Rent</Badge>}
              {property.isUnderConstruction && <Badge variant="outline">Under Construction</Badge>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{property.title}</h1>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{property.location}</span>
            </div>
          </div>

          {/* Price */}
          <div className="bg-primary/10 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Price</p>
            <p className="text-3xl font-bold text-primary">{formatPrice(property.price)}</p>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-muted/40 rounded-xl p-3 text-center">
              <BedDouble className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">BHK</p>
              <p className="font-semibold text-sm">{BHK_LABELS[property.bhkType] || property.bhkType}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3 text-center">
              <Maximize2 className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Carpet Area</p>
              <p className="font-semibold text-sm">{property.carpetArea.toString()} sq ft</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3 text-center">
              <Wind className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Balcony</p>
              <p className="font-semibold text-sm">{property.hasBalcony ? 'Yes' : 'No'}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3 text-center">
              <Car className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Parking</p>
              <p className="font-semibold text-sm">{property.parkingSpaces.toString()} spots</p>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">About this property</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Property Info */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Property Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between bg-muted/30 rounded-lg px-3 py-2">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}</span>
              </div>
              <div className="flex justify-between bg-muted/30 rounded-lg px-3 py-2">
                <span className="text-muted-foreground">Built-up Area</span>
                <span className="font-medium">{property.builtUpArea.toString()} sq ft</span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {property.amenities.map((amenity: Amenity) => (
                  <div key={amenity} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{AMENITY_LABELS[amenity] || amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Agent + Enquiry */}
        <div className="space-y-6">
          <AgentCard
            name={ownerProfile?.name}
            email={ownerProfile?.email}
            phone={ownerProfile?.phone}
            isLoading={profileLoading}
          />

          {/* Enquiry Form */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Send Enquiry</h3>
            {enquirySent ? (
              <div className="text-center py-4">
                <CheckCircle className="w-10 h-10 text-primary mx-auto mb-2" />
                <p className="font-medium text-foreground">Enquiry Sent!</p>
                <p className="text-sm text-muted-foreground mt-1">We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleEnquiry} className="space-y-3">
                <div>
                  <Label htmlFor="enq-name">Name</Label>
                  <Input id="enq-name" className="mt-1" value={enquiryForm.name} onChange={e => setEnquiryForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <Label htmlFor="enq-phone">Phone</Label>
                  <Input id="enq-phone" className="mt-1" value={enquiryForm.phone} onChange={e => setEnquiryForm(f => ({ ...f, phone: e.target.value }))} required />
                </div>
                <div>
                  <Label htmlFor="enq-email">Email</Label>
                  <Input id="enq-email" className="mt-1" type="email" value={enquiryForm.email} onChange={e => setEnquiryForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <Label htmlFor="enq-message">Message</Label>
                  <Textarea id="enq-message" className="mt-1" rows={3} value={enquiryForm.message} onChange={e => setEnquiryForm(f => ({ ...f, message: e.target.value }))} required />
                </div>
                <Button type="submit" className="w-full" disabled={createEnquiry.isPending}>
                  {createEnquiry.isPending ? 'Sending...' : 'Send Enquiry'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
