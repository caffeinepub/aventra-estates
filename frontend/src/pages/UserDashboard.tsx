import React from 'react';
import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyProperties, useDeleteProperty } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Plus, Edit, Trash2, Eye, Building2, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { ListingStatus } from '../backend';

function formatPrice(price: bigint): string {
  const n = Number(price);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === ListingStatus.active)
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
        <CheckCircle size={10} className="mr-1" />Live
      </Badge>
    );
  if (status === ListingStatus.pending)
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
        <Clock size={10} className="mr-1" />Awaiting Review
      </Badge>
    );
  if (status === ListingStatus.rejected)
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
        <XCircle size={10} className="mr-1" />Rejected
      </Badge>
    );
  if (status === ListingStatus.rent)
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
        <CheckCircle size={10} className="mr-1" />For Rent
      </Badge>
    );
  if (status === ListingStatus.sold)
    return (
      <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
        <XCircle size={10} className="mr-1" />Sold
      </Badge>
    );
  return <Badge variant="outline" className="text-xs">{status}</Badge>;
}

export default function UserDashboard() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: properties, isLoading: propsLoading } = useGetMyProperties();
  const deleteProperty = useDeleteProperty();

  if (!identity) {
    return <AccessDeniedScreen />;
  }

  const handleDelete = async (id: bigint, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteProperty.mutateAsync(id);
      toast.success('Property deleted successfully.');
    } catch {
      toast.error('Failed to delete property.');
    }
  };

  const stats = {
    total: properties?.length ?? 0,
    active: properties?.filter((p) => p.status === ListingStatus.active || p.status === ListingStatus.rent).length ?? 0,
    pending: properties?.filter((p) => p.status === ListingStatus.pending).length ?? 0,
    rejected: properties?.filter((p) => p.status === ListingStatus.rejected).length ?? 0,
  };

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              {profileLoading ? 'Loading...' : `Welcome, ${profile?.name || 'User'}`}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your property listings and enquiries</p>
          </div>
          <Link
            to="/post-property"
            className="gold-gradient text-obsidian font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 hover:opacity-90 transition-all text-sm w-fit"
          >
            <Plus size={16} /> Post New Property
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Building2, label: 'Total Listings', value: stats.total, color: 'text-gold' },
            { icon: CheckCircle, label: 'Live / Rent', value: stats.active, color: 'text-green-600' },
            { icon: Clock, label: 'Pending Review', value: stats.pending, color: 'text-amber-600' },
            { icon: XCircle, label: 'Rejected', value: stats.rejected, color: 'text-red-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground font-serif">{value}</p>
                <p className="text-muted-foreground text-xs">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pending notice */}
        {stats.pending > 0 && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2 text-amber-800 dark:text-amber-300 text-sm">
            <Clock size={15} className="shrink-0" />
            <span>
              You have <strong>{stats.pending}</strong> propert{stats.pending === 1 ? 'y' : 'ies'} awaiting admin review before going live.
            </span>
          </div>
        )}

        {/* Rejected notice */}
        {stats.rejected > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-800 dark:text-red-300 text-sm">
            <XCircle size={15} className="shrink-0" />
            <span>
              <strong>{stats.rejected}</strong> propert{stats.rejected === 1 ? 'y' : 'ies'} rejected. Please edit and resubmit for review.
            </span>
          </div>
        )}

        {/* Properties Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-serif font-semibold text-foreground">My Listings</h2>
            <BarChart3 size={18} className="text-muted-foreground" />
          </div>

          {propsLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : !properties || properties.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 size={48} className="text-gold/30 mx-auto mb-4" />
              <p className="font-serif text-lg text-muted-foreground mb-2">No listings yet</p>
              <p className="text-sm text-muted-foreground mb-6">Start by posting your first property.</p>
              <Link
                to="/post-property"
                className="gold-gradient text-obsidian font-semibold px-6 py-2.5 rounded-full text-sm hover:opacity-90 transition-all inline-flex items-center gap-2"
              >
                <Plus size={15} /> Post Property Free
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {properties.map((property) => {
                // Use ExternalBlob images only (photos is now Uint8Array[], not displayable as src)
                const primaryPhoto = property.images && property.images.length > 0
                  ? property.images[0].getDirectURL()
                  : null;

                return (
                  <div key={property.id.toString()} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Image */}
                    <div className="w-full sm:w-20 h-32 sm:h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                      {primaryPhoto ? (
                        <img
                          src={primaryPhoto}
                          alt={property.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 size={20} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-1">{property.title}</h3>
                      <p className="text-muted-foreground text-xs mt-0.5">{property.location}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="font-serif font-bold text-gold text-sm">{formatPrice(property.price)}</span>
                        <StatusBadge status={property.status} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to="/properties/$id"
                        params={{ id: property.id.toString() }}
                        className="p-2 rounded-lg border border-border hover:border-gold hover:text-gold transition-colors text-muted-foreground"
                        title="View"
                      >
                        <Eye size={15} />
                      </Link>
                      <Link
                        to="/edit-property/$id"
                        params={{ id: property.id.toString() }}
                        className="p-2 rounded-lg border border-border hover:border-gold hover:text-gold transition-colors text-muted-foreground"
                        title="Edit"
                      >
                        <Edit size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(property.id, property.title)}
                        disabled={deleteProperty.isPending}
                        className="p-2 rounded-lg border border-border hover:border-destructive hover:text-destructive transition-colors text-muted-foreground disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
