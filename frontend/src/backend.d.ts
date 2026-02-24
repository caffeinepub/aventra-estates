import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Testimonial {
    id: bigint;
    quote: string;
    author: string;
    rating: bigint;
}
export interface AnalyticsSummary {
    pendingApprovals: bigint;
    totalProperties: bigint;
    totalEnquiries: bigint;
    totalUsers: bigint;
}
export interface Enquiry {
    id: bigint;
    senderPhone: string;
    propertyId: bigint;
    message: string;
    timestamp: bigint;
    senderName: string;
    senderEmail: string;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface Property {
    id: bigint;
    status: ListingStatus;
    title: string;
    propertyType: PropertyType;
    isLuxury: boolean;
    owner: Principal;
    carpetArea: bigint;
    bhkType: BhkType;
    builtUpArea: bigint;
    description: string;
    amenities: Array<Amenity>;
    isUnderConstruction: boolean;
    isFeatured: boolean;
    hasBalcony: boolean;
    price: bigint;
    location: string;
    parkingSpaces: bigint;
    photos: Array<Uint8Array>;
    images: Array<ExternalBlob>;
}
export enum Amenity {
    gym = "gym",
    swimmingPool = "swimmingPool",
    balcony = "balcony",
    club = "club",
    lift = "lift",
    garden = "garden",
    security = "security",
    powerBackup = "powerBackup",
    playground = "playground",
    parking = "parking",
    gardenArea = "gardenArea"
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum BhkType {
    bhk1 = "bhk1",
    bhk2 = "bhk2",
    bhk3 = "bhk3",
    bhk4 = "bhk4",
    bhk5plus = "bhk5plus"
}
export enum ListingStatus {
    active = "active",
    pending = "pending",
    rent = "rent",
    sold = "sold",
    rejected = "rejected"
}
export enum PropertyType {
    commercial = "commercial",
    villa = "villa",
    plot = "plot",
    apartment = "apartment",
    rowHouse = "rowHouse"
}
export enum Role {
    admin = "admin",
    user = "user"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAmenities(propertyId: bigint, amenities: Array<Amenity>): Promise<void>;
    addToWishlist(propertyId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignRole(user: Principal, role: Role): Promise<void>;
    createEnquiry(enquiry: {
        senderPhone: string;
        propertyId: bigint;
        message: string;
        timestamp: bigint;
        senderName: string;
        senderEmail: string;
    }): Promise<bigint>;
    createProperty(property: {
        title: string;
        propertyType: PropertyType;
        isLuxury: boolean;
        carpetArea: bigint;
        bhkType: BhkType;
        builtUpArea: bigint;
        description: string;
        amenities: Array<Amenity>;
        isUnderConstruction: boolean;
        isFeatured: boolean;
        hasBalcony: boolean;
        price: bigint;
        location: string;
        parkingSpaces: bigint;
        photos: Array<Uint8Array>;
        images: Array<ExternalBlob>;
    }): Promise<bigint>;
    createTestimonial(testimonial: {
        quote: string;
        author: string;
        rating: bigint;
    }): Promise<bigint>;
    deleteProperty(propertyId: bigint): Promise<void>;
    getAllPropertiesAdmin(): Promise<Array<Property>>;
    getAllUsers(): Promise<Array<{
        principal: Principal;
        name: string;
        role: Role;
        email: string;
        phone: string;
    }>>;
    getAnalyticsSummary(): Promise<AnalyticsSummary>;
    getCallerUserProfile(): Promise<{
        name: string;
        email: string;
        phone: string;
    }>;
    getCallerUserRole(): Promise<UserRole>;
    getEnquiries(): Promise<Array<Enquiry>>;
    getEnquiriesForProperty(propertyId: bigint): Promise<Array<Enquiry>>;
    getFeaturedProperties(): Promise<Array<Property>>;
    getForRentProperties(): Promise<Array<Property>>;
    getMyProperties(): Promise<Array<Property>>;
    getProperties(): Promise<Array<Property>>;
    getProperty(id: bigint): Promise<Property>;
    getSortedPropertiesByLocation(): Promise<Array<Property>>;
    getSortedPropertiesByPrice(_ascending: boolean): Promise<Array<Property>>;
    getTestimonials(): Promise<Array<Testimonial>>;
    getUserProfile(target: Principal): Promise<{
        name: string;
        email: string;
        phone: string;
    }>;
    getWishlist(): Promise<Array<bigint>>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    removeFromWishlist(propertyId: bigint): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: {
        name: string;
        email: string;
        phone: string;
    }): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setPropertyFeatured(propertyId: bigint, isFeatured: boolean): Promise<void>;
    setPropertyStatus(propertyId: bigint, status: ListingStatus): Promise<void>;
    updateProperty(propertyId: bigint, update: {
        title: string;
        propertyType: PropertyType;
        isLuxury: boolean;
        carpetArea: bigint;
        bhkType: BhkType;
        builtUpArea: bigint;
        description: string;
        amenities: Array<Amenity>;
        isUnderConstruction: boolean;
        hasBalcony: boolean;
        price: bigint;
        location: string;
        parkingSpaces: bigint;
        photos: Array<Uint8Array>;
        images: Array<ExternalBlob>;
    }): Promise<void>;
    updatePropertyStatus(propertyId: bigint, status: ListingStatus): Promise<void>;
}
