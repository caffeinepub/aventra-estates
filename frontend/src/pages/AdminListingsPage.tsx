import React from 'react';
import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetProperties, useSetPropertyStatus, useSetPropertyFeatured, useDeleteProperty } from '../hooks/useQueries';
import { ArrowLeft, Star, StarOff, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { ListingStatus } from '../backend';

function formatPrice(price: bigint): string {
  const n = Number(price);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(0)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function AdminListingsPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: properties, isLoading } = useGetProperties();
  const setStatus = useSetPropertyStatus();
  const setFeatured = useSetPropertyFeatured();
  const deleteProperty = useDeleteProperty();

  if (!identity || (!adminLoading && !isAdmin)) return <AccessDeniedScreen />;

  const handleApprove = async (id: bigint) => {
    try { await setStatus.mutateAsync({ id, status: ListingStatus.active }); toast.success('Property approved.'); }
    catch { toast.error('Failed to approve.'); }
  };
  const handleReject = async (id: bigint) => {
    try { await setStatus.mutateAsync({ id, status: ListingStatus.sold }); toast.success('Property rejected.'); }
    catch { toast.error('Failed to reject.'); }
  };
  const handleFeature = async (id: bigint, current: boolean) => {
    try { await setFeatured.mutateAsync({ id, isFeatured: !current }); toast.success(current ? 'Removed from featured.' : 'Marked as featured.'); }
    catch { toast.error('Failed to update.'); }
  };
  const handleDelete = async (id: bigint) => {
    if (!confirm('Delete this property?')) return;
    try { await deleteProperty.mutateAsync(id); toast.success('Property deleted.'); }
    catch { toast.error('Failed to delete.'); }
  };

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin" className="p-2 rounded-lg border border-border hover:border-gold hover:text-gold transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Manage Listings</h1>
            <p className="text-muted-foreground text-sm">{properties?.length ?? 0} total properties</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-5 space-y-3">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : !properties || properties.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No properties found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Property</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Price</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">Status</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground hidden lg:table-cell">Flags</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {properties.map((property) => (
                    <tr key={property.id.toString()} className="hover:bg-secondary/50 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground line-clamp-1">{property.title}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{property.location}</p>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="font-serif font-bold text-gold">{formatPrice(property.price)}</span>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        {property.status === ListingStatus.active && <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>}
                        {property.status === ListingStatus.pending && <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>}
                        {property.status === ListingStatus.sold && <Badge className="bg-red-100 text-red-700 border-red-200">Sold</Badge>}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="flex gap-1">
                          {property.isFeatured && <Badge variant="outline" className="text-xs border-gold text-gold">Featured</Badge>}
                          {property.isLuxury && <Badge variant="outline" className="text-xs">Luxury</Badge>}
                          {property.isUnderConstruction && <Badge variant="outline" className="text-xs">UC</Badge>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to="/properties/$id" params={{ id: property.id.toString() }}
                            className="p-1.5 rounded border border-border hover:border-gold hover:text-gold transition-colors text-muted-foreground" title="View">
                            <Eye size={14} />
                          </Link>
                          <button onClick={() => handleApprove(property.id)}
                            className="p-1.5 rounded border border-border hover:border-green-500 hover:text-green-600 transition-colors text-muted-foreground" title="Approve">
                            <CheckCircle size={14} />
                          </button>
                          <button onClick={() => handleReject(property.id)}
                            className="p-1.5 rounded border border-border hover:border-red-500 hover:text-red-600 transition-colors text-muted-foreground" title="Reject">
                            <XCircle size={14} />
                          </button>
                          <button onClick={() => handleFeature(property.id, property.isFeatured)}
                            className="p-1.5 rounded border border-border hover:border-gold hover:text-gold transition-colors text-muted-foreground" title="Toggle Featured">
                            {property.isFeatured ? <StarOff size={14} /> : <Star size={14} />}
                          </button>
                          <button onClick={() => handleDelete(property.id)}
                            className="p-1.5 rounded border border-border hover:border-destructive hover:text-destructive transition-colors text-muted-foreground" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
