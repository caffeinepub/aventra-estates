import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useIsCallerAdmin,
  useGetAllPropertiesAdmin,
  useUpdatePropertyStatus,
  useSetPropertyFeatured,
  useDeleteProperty,
} from '../hooks/useQueries';
import { ArrowLeft, Star, StarOff, CheckCircle, XCircle, Trash2, Eye, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { ListingStatus } from '../backend';
import type { Property } from '../backend';

function formatPrice(price: bigint): string {
  const n = Number(price);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(0)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === ListingStatus.active)
    return <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400">Active</Badge>;
  if (status === ListingStatus.pending)
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"><Clock size={10} className="mr-1" />Pending</Badge>;
  if (status === ListingStatus.rejected)
    return <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400">Rejected</Badge>;
  if (status === ListingStatus.sold)
    return <Badge className="bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400">Sold</Badge>;
  if (status === ListingStatus.rent)
    return <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">For Rent</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function PropertyRow({
  property,
  onApprove,
  onReject,
  onFeature,
  onDelete,
  isProcessing,
}: {
  property: Property;
  onApprove: (id: bigint) => void;
  onReject: (id: bigint) => void;
  onFeature: (id: bigint, current: boolean) => void;
  onDelete: (id: bigint) => void;
  isProcessing: boolean;
}) {
  const isPending = property.status === ListingStatus.pending;

  return (
    <tr className="hover:bg-secondary/50 transition-colors">
      <td className="p-4">
        <p className="font-medium text-foreground line-clamp-1">{property.title}</p>
        <p className="text-muted-foreground text-xs mt-0.5">{property.location}</p>
      </td>
      <td className="p-4 hidden md:table-cell">
        <span className="font-serif font-bold text-gold">{formatPrice(property.price)}</span>
      </td>
      <td className="p-4 hidden sm:table-cell">
        <StatusBadge status={property.status} />
      </td>
      <td className="p-4 hidden lg:table-cell">
        <div className="flex gap-1 flex-wrap">
          {property.isFeatured && <Badge variant="outline" className="text-xs border-gold text-gold">Featured</Badge>}
          {property.isLuxury && <Badge variant="outline" className="text-xs">Luxury</Badge>}
          {property.isUnderConstruction && <Badge variant="outline" className="text-xs">UC</Badge>}
          {property.hasBalcony && <Badge variant="outline" className="text-xs">Balcony</Badge>}
          {Number(property.parkingSpaces) > 0 && (
            <Badge variant="outline" className="text-xs">{Number(property.parkingSpaces)}P</Badge>
          )}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to="/properties/$id"
            params={{ id: property.id.toString() }}
            className="p-1.5 rounded border border-border hover:border-gold hover:text-gold transition-colors text-muted-foreground"
            title="View"
          >
            <Eye size={14} />
          </Link>
          {isPending && (
            <>
              <button
                onClick={() => onApprove(property.id)}
                disabled={isProcessing}
                className="p-1.5 rounded border border-border hover:border-green-500 hover:text-green-600 transition-colors text-muted-foreground disabled:opacity-50"
                title="Approve"
              >
                <CheckCircle size={14} />
              </button>
              <button
                onClick={() => onReject(property.id)}
                disabled={isProcessing}
                className="p-1.5 rounded border border-border hover:border-red-500 hover:text-red-600 transition-colors text-muted-foreground disabled:opacity-50"
                title="Reject"
              >
                <XCircle size={14} />
              </button>
            </>
          )}
          {!isPending && (
            <button
              onClick={() => onApprove(property.id)}
              disabled={isProcessing}
              className="p-1.5 rounded border border-border hover:border-green-500 hover:text-green-600 transition-colors text-muted-foreground disabled:opacity-50"
              title="Set Active"
            >
              <CheckCircle size={14} />
            </button>
          )}
          <button
            onClick={() => onFeature(property.id, property.isFeatured)}
            disabled={isProcessing}
            className="p-1.5 rounded border border-border hover:border-gold hover:text-gold transition-colors text-muted-foreground disabled:opacity-50"
            title="Toggle Featured"
          >
            {property.isFeatured ? <StarOff size={14} /> : <Star size={14} />}
          </button>
          <button
            onClick={() => onDelete(property.id)}
            disabled={isProcessing}
            className="p-1.5 rounded border border-border hover:border-destructive hover:text-destructive transition-colors text-muted-foreground disabled:opacity-50"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminListingsPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: allProperties, isLoading } = useGetAllPropertiesAdmin();
  const updateStatus = useUpdatePropertyStatus();
  const setFeatured = useSetPropertyFeatured();
  const deleteProperty = useDeleteProperty();

  if (!identity || (!adminLoading && !isAdmin)) return <AccessDeniedScreen />;

  const handleApprove = async (id: bigint) => {
    try {
      await updateStatus.mutateAsync({ id, status: ListingStatus.active });
      toast.success('Property approved and set to active.');
    } catch {
      toast.error('Failed to approve property.');
    }
  };

  const handleReject = async (id: bigint) => {
    try {
      await updateStatus.mutateAsync({ id, status: ListingStatus.rejected });
      toast.success('Property rejected.');
    } catch {
      toast.error('Failed to reject property.');
    }
  };

  const handleFeature = async (id: bigint, current: boolean) => {
    try {
      await setFeatured.mutateAsync({ id, isFeatured: !current });
      toast.success(current ? 'Removed from featured.' : 'Marked as featured.');
    } catch {
      toast.error('Failed to update featured status.');
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Delete this property? This action cannot be undone.')) return;
    try {
      await deleteProperty.mutateAsync(id);
      toast.success('Property deleted.');
    } catch {
      toast.error('Failed to delete property.');
    }
  };

  const isProcessing = updateStatus.isPending || setFeatured.isPending || deleteProperty.isPending;

  const pendingProperties = (allProperties ?? []).filter((p) => p.status === ListingStatus.pending);
  const activeProperties = (allProperties ?? []).filter((p) => p.status === ListingStatus.active);
  const rejectedProperties = (allProperties ?? []).filter((p) => p.status === ListingStatus.rejected);

  const renderTable = (properties: Property[]) => {
    if (properties.length === 0) {
      return <div className="p-12 text-center text-muted-foreground">No properties in this category.</div>;
    }
    return (
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
              <PropertyRow
                key={property.id.toString()}
                property={property}
                onApprove={handleApprove}
                onReject={handleReject}
                onFeature={handleFeature}
                onDelete={handleDelete}
                isProcessing={isProcessing}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
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
            <p className="text-muted-foreground text-sm">
              {allProperties?.length ?? 0} total &bull; {pendingProperties.length} pending review
            </p>
          </div>
        </div>

        {/* Pending alert */}
        {pendingProperties.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2 text-amber-800 dark:text-amber-300 text-sm">
            <Clock size={16} className="shrink-0" />
            <span>
              <strong>{pendingProperties.length}</strong> propert{pendingProperties.length === 1 ? 'y' : 'ies'} awaiting your review.
            </span>
          </div>
        )}

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : (
            <Tabs defaultValue="pending">
              <div className="px-4 pt-4 border-b border-border">
                <TabsList className="mb-0">
                  <TabsTrigger value="pending" className="gap-1.5">
                    Pending
                    {pendingProperties.length > 0 && (
                      <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                        {pendingProperties.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="active">
                    Active ({activeProperties.length})
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Rejected ({rejectedProperties.length})
                  </TabsTrigger>
                  <TabsTrigger value="all">
                    All ({allProperties?.length ?? 0})
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="pending" className="mt-0">
                {renderTable(pendingProperties)}
              </TabsContent>
              <TabsContent value="active" className="mt-0">
                {renderTable(activeProperties)}
              </TabsContent>
              <TabsContent value="rejected" className="mt-0">
                {renderTable(rejectedProperties)}
              </TabsContent>
              <TabsContent value="all" className="mt-0">
                {renderTable(allProperties ?? [])}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
