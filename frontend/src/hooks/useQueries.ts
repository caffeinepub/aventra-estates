import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Property, Testimonial, Enquiry, UserApprovalInfo, AnalyticsSummary, ListingStatus, PropertyType, BhkType, Amenity, ApprovalStatus, Role } from '../backend';
import { Principal } from '@dfinity/principal';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<{ name: string; email: string; phone: string } | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { name: string; email: string; phone: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserProfile(target: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['userProfile', target?.toString()],
    queryFn: async () => {
      if (!actor || !target) throw new Error('Not available');
      return actor.getUserProfile(target);
    },
    enabled: !!actor && !isFetching && !!target,
  });
}

// ─── Properties ──────────────────────────────────────────────────────────────

export function useGetProperties() {
  const { actor, isFetching } = useActor();

  return useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProperties();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFeaturedProperties() {
  const { actor, isFetching } = useActor();

  return useQuery<Property[]>({
    queryKey: ['featuredProperties'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedProperties();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProperty(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Property>({
    queryKey: ['property', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error('Not available');
      return actor.getProperty(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetMyProperties() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Property[]>({
    queryKey: ['myProperties', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyProperties();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateProperty() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (property: {
      status: ListingStatus;
      title: string;
      propertyType: PropertyType;
      isLuxury: boolean;
      carpetArea: bigint;
      bhkType: BhkType;
      builtUpArea: bigint;
      description: string;
      isUnderConstruction: boolean;
      isFeatured: boolean;
      price: bigint;
      location: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProperty(property);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['myProperties'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProperties'] });
    },
  });
}

export function useUpdateProperty() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, update }: {
      id: bigint;
      update: {
        status: ListingStatus;
        title: string;
        propertyType: PropertyType;
        isLuxury: boolean;
        carpetArea: bigint;
        bhkType: BhkType;
        builtUpArea: bigint;
        description: string;
        isUnderConstruction: boolean;
        price: bigint;
        location: string;
      };
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProperty(id, update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['myProperties'] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
    },
  });
}

export function useDeleteProperty() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProperty(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['myProperties'] });
    },
  });
}

export function useAddAmenities() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ propertyId, amenities }: { propertyId: bigint; amenities: Amenity[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAmenities(propertyId, amenities);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
    },
  });
}

export function useSetPropertyStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: ListingStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPropertyStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useSetPropertyFeatured() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isFeatured }: { id: bigint; isFeatured: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPropertyFeatured(id, isFeatured);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProperties'] });
    },
  });
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export function useGetWishlist() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint[]>({
    queryKey: ['wishlist', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getWishlist();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddToWishlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToWishlist(propertyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useRemoveFromWishlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeFromWishlist(propertyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

// ─── Enquiries ────────────────────────────────────────────────────────────────

export function useCreateEnquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enquiry: {
      propertyId: bigint;
      senderName: string;
      senderPhone: string;
      senderEmail: string;
      message: string;
      timestamp: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEnquiry(enquiry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
    },
  });
}

export function useGetEnquiries() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Enquiry[]>({
    queryKey: ['enquiries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEnquiries();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetEnquiriesForProperty(propertyId: bigint | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Enquiry[]>({
    queryKey: ['enquiriesForProperty', propertyId?.toString()],
    queryFn: async () => {
      if (!actor || propertyId === null) return [];
      try {
        return await actor.getEnquiriesForProperty(propertyId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identity && propertyId !== null,
  });
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export function useGetTestimonials() {
  const { actor, isFetching } = useActor();

  return useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTestimonials();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useGetAnalyticsSummary() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<AnalyticsSummary>({
    queryKey: ['analyticsSummary'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAnalyticsSummary();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Array<{ principal: Principal; name: string; role: Role; email: string; phone: string }>>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCallerApproved', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerApproved();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: Role }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}
