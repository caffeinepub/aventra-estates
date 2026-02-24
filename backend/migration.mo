import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";

module {
  type OldRole = {
    #user;
    #admin;
  };

  type OldListingStatus = {
    #active;
    #pending;
    #sold;
  };

  type OldAmenity = {
    #parking;
    #gym;
    #swimmingPool;
    #garden;
    #security;
    #playground;
  };

  type OldPropertyType = {
    #apartment;
    #villa;
    #rowHouse;
    #plot;
    #commercial;
  };

  type OldBhkType = {
    #bhk1;
    #bhk2;
    #bhk3;
    #bhk4;
    #bhk5plus;
  };

  type OldProperty = {
    id : Nat;
    owner : Principal.Principal;
    title : Text;
    description : Text;
    price : Nat;
    location : Text;
    propertyType : OldPropertyType;
    bhkType : OldBhkType;
    carpetArea : Nat;
    builtUpArea : Nat;
    amenities : [OldAmenity];
    images : [Storage.ExternalBlob];
    status : OldListingStatus;
    isFeatured : Bool;
    isLuxury : Bool;
    isUnderConstruction : Bool;
  };

  type OldUser = {
    principal : Principal.Principal;
    name : Text;
    email : Text;
    phone : Text;
    role : OldRole;
    wishlist : Set.Set<Nat>;
  };

  type OldEnquiry = {
    id : Nat;
    propertyId : Nat;
    senderName : Text;
    senderPhone : Text;
    senderEmail : Text;
    message : Text;
    timestamp : Int;
  };

  type OldTestimonial = {
    id : Nat;
    author : Text;
    quote : Text;
    rating : Nat;
  };

  type OldActor = {
    userApprovalState : UserApproval.UserApprovalState;
    accessControlState : AccessControl.AccessControlState;
    propertyIdCounter : Nat;
    enquiryIdCounter : Nat;
    testimonialIdCounter : Nat;
    users : Map.Map<Principal.Principal, OldUser>;
    properties : Map.Map<Nat, OldProperty>;
    enquiries : Map.Map<Nat, OldEnquiry>;
    testimonials : Map.Map<Nat, OldTestimonial>;
  };

  type NewRole = {
    #user;
    #admin;
  };

  type NewListingStatus = {
    #active;
    #pending;
    #sold;
    #rent;
  };

  type NewAmenity = {
    #parking;
    #gym;
    #swimmingPool;
    #garden;
    #security;
    #playground;
  };

  type NewPropertyType = {
    #apartment;
    #villa;
    #rowHouse;
    #plot;
    #commercial;
  };

  type NewBhkType = {
    #bhk1;
    #bhk2;
    #bhk3;
    #bhk4;
    #bhk5plus;
  };

  type NewProperty = {
    id : Nat;
    owner : Principal.Principal;
    title : Text;
    description : Text;
    price : Nat;
    location : Text;
    propertyType : NewPropertyType;
    bhkType : NewBhkType;
    carpetArea : Nat;
    builtUpArea : Nat;
    amenities : [NewAmenity];
    images : [Storage.ExternalBlob];
    status : NewListingStatus;
    isFeatured : Bool;
    isLuxury : Bool;
    isUnderConstruction : Bool;
  };

  type NewUser = {
    principal : Principal.Principal;
    name : Text;
    email : Text;
    phone : Text;
    role : NewRole;
    wishlist : Set.Set<Nat>;
  };

  type NewEnquiry = {
    id : Nat;
    propertyId : Nat;
    senderName : Text;
    senderPhone : Text;
    senderEmail : Text;
    message : Text;
    timestamp : Int;
  };

  type NewTestimonial = {
    id : Nat;
    author : Text;
    quote : Text;
    rating : Nat;
  };

  type NewActor = {
    userApprovalState : UserApproval.UserApprovalState;
    accessControlState : AccessControl.AccessControlState;
    propertyIdCounter : Nat;
    enquiryIdCounter : Nat;
    testimonialIdCounter : Nat;
    users : Map.Map<Principal.Principal, NewUser>;
    properties : Map.Map<Nat, NewProperty>;
    enquiries : Map.Map<Nat, NewEnquiry>;
    testimonials : Map.Map<Nat, NewTestimonial>;
  };

  public func run(old : OldActor) : NewActor {
    let newProperties = old.properties.map<Nat, OldProperty, NewProperty>(
      func(_id, prop) {
        {
          id = prop.id;
          owner = prop.owner;
          title = prop.title;
          description = prop.description;
          price = prop.price;
          location = prop.location;
          propertyType = prop.propertyType;
          bhkType = prop.bhkType;
          carpetArea = prop.carpetArea;
          builtUpArea = prop.builtUpArea;
          amenities = prop.amenities;
          images = prop.images;
          status = (prop.status : NewListingStatus); // Add : NewListingStatus to clarify conversion
          isFeatured = prop.isFeatured;
          isLuxury = prop.isLuxury;
          isUnderConstruction = prop.isUnderConstruction;
        };
      }
    );

    {
      userApprovalState = old.userApprovalState;
      accessControlState = old.accessControlState;
      propertyIdCounter = old.propertyIdCounter;
      enquiryIdCounter = old.enquiryIdCounter;
      testimonialIdCounter = old.testimonialIdCounter;
      users = old.users;
      properties = newProperties;
      enquiries = old.enquiries;
      testimonials = old.testimonials;
    };
  };
};
