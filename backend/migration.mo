import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Blob "mo:core/Blob";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import Principal "mo:core/Principal";

module {
  type ApprovalStatus = UserApproval.ApprovalStatus;
  type Role = { #user; #admin };
  type ListingStatus = { #active; #pending; #sold; #rent; #rejected };
  type Amenity = {
    #parking;
    #gym;
    #swimmingPool;
    #garden;
    #security;
    #playground;
    #gardenArea;
    #balcony;
    #lift;
    #club;
    #powerBackup;
  };
  type PropertyType = { #apartment; #villa; #rowHouse; #plot; #commercial };
  type BhkType = { #bhk1; #bhk2; #bhk3; #bhk4; #bhk5plus };
  type PropertyOld = {
    id : Nat;
    owner : Principal;
    title : Text;
    description : Text;
    price : Nat;
    location : Text;
    propertyType : PropertyType;
    bhkType : BhkType;
    carpetArea : Nat;
    builtUpArea : Nat;
    amenities : [Amenity];
    images : [Storage.ExternalBlob];
    status : ListingStatus;
    isFeatured : Bool;
    isLuxury : Bool;
    isUnderConstruction : Bool;
    photos : [Text];
    hasBalcony : Bool;
    parkingSpaces : Nat;
  };
  type PropertyNew = {
    id : Nat;
    owner : Principal;
    title : Text;
    description : Text;
    price : Nat;
    location : Text;
    propertyType : PropertyType;
    bhkType : BhkType;
    carpetArea : Nat;
    builtUpArea : Nat;
    amenities : [Amenity];
    images : [Storage.ExternalBlob];
    status : ListingStatus;
    isFeatured : Bool;
    isLuxury : Bool;
    isUnderConstruction : Bool;
    photos : [Blob];
    hasBalcony : Bool;
    parkingSpaces : Nat;
  };
  type User = {
    principal : Principal;
    name : Text;
    email : Text;
    phone : Text;
    role : Role;
    wishlist : Set.Set<Nat>;
  };
  type Enquiry = {
    id : Nat;
    propertyId : Nat;
    senderName : Text;
    senderPhone : Text;
    senderEmail : Text;
    message : Text;
    timestamp : Int;
  };
  type Testimonial = {
    id : Nat;
    author : Text;
    quote : Text;
    rating : Nat;
  };

  type OldActor = {
    propertyIdCounter : Nat;
    enquiryIdCounter : Nat;
    testimonialIdCounter : Nat;
    accessControlState : AccessControl.AccessControlState;
    userApprovalState : UserApproval.UserApprovalState;
    users : Map.Map<Principal, User>;
    properties : Map.Map<Nat, PropertyOld>;
    enquiries : Map.Map<Nat, Enquiry>;
    testimonials : Map.Map<Nat, Testimonial>;
  };

  type NewActor = {
    propertyIdCounter : Nat;
    enquiryIdCounter : Nat;
    testimonialIdCounter : Nat;
    accessControlState : AccessControl.AccessControlState;
    userApprovalState : UserApproval.UserApprovalState;
    users : Map.Map<Principal, User>;
    properties : Map.Map<Nat, PropertyNew>;
    enquiries : Map.Map<Nat, Enquiry>;
    testimonials : Map.Map<Nat, Testimonial>;
  };

  public func run(old : OldActor) : NewActor {
    let newProperties = old.properties.map<Nat, PropertyOld, PropertyNew>(
      func(_id, oldProperty) {
        {
          oldProperty with
          photos = []
        };
      }
    );
    {
      old with
      properties = newProperties;
    };
  };
};
