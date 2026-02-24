import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyProperties, useDeleteProperty, useGetEnquiriesForProperty } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Plus, Edit, Trash2, Eye, Building2, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import type { Property } from '../backend';
import { ListingStatus } from '../backend';

function formatPrice(price: bigint): string {
  const n = Number(price);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === ListingStatus.active) return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle size={11} className="mr-1" />Active</Badge>;
  if (status === ListingStatus.pending) return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Clock size={11} className="mr-1" />Pending</Badge>;
  return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle size={11} className="mr-1" />Sold</Badge>;
}

export default function UserDashboard() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
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
    active: properties?.filter((p) => p.status === ListingStatus.active).length ?? 0,
    pending: properties?.filter((p) => p.status === ListingStatus.pending).length ?? 0,
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Building2, label: 'Total Listings', value: stats.total, color: 'text-gold' },
            { icon: CheckCircle, label: 'Active Listings', value: stats.active, color: 'text-green-600' },
            { icon: Clock, label: 'Pending Approval', value: stats.pending, color: 'text-amber-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground font-serif">{value}</p>
                <p className="text-muted-foreground text-sm">{label}</p>
              </div>
            </div>
          ))}
        </div>

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
              {properties.map((property) => (
                <div key={property.id.toString()} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Image */}
                  <div className="w-full sm:w-20 h-32 sm:h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    {property.images.length > 0 ? (
                      <img src={property.images[0].getDirectURL()} alt={property.title} className="w-full h-full object-cover" />
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
                    <div className="flex items-center gap-2 mt-1.5">
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
