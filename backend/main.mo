import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import UserApproval "user-approval/approval";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor {
  // === Type Definitions ===

  public type Role = {
    #user;
    #admin;
  };

  public type ListingStatus = {
    #active;
    #pending;
    #sold;
    #rent; // Add rent as valid status
  };

  public type Amenity = {
    #parking;
    #gym;
    #swimmingPool;
    #garden;
    #security;
    #playground;
  };

  public type PropertyType = {
    #apartment;
    #villa;
    #rowHouse;
    #plot;
    #commercial;
  };

  public type BhkType = {
    #bhk1;
    #bhk2;
    #bhk3;
    #bhk4;
    #bhk5plus;
  };

  public type Property = {
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
    status : ListingStatus; // Includes for sale, sold, and rent now
    isFeatured : Bool;
    isLuxury : Bool;
    isUnderConstruction : Bool;
  };

  public type User = {
    principal : Principal;
    name : Text;
    email : Text;
    phone : Text;
    role : Role;
    wishlist : Set.Set<Nat>;
  };

  public type Enquiry = {
    id : Nat;
    propertyId : Nat;
    senderName : Text;
    senderPhone : Text;
    senderEmail : Text;
    message : Text;
    timestamp : Int;
  };

  public type Testimonial = {
    id : Nat;
    author : Text;
    quote : Text;
    rating : Nat;
  };

  public type AnalyticsSummary = {
    totalProperties : Nat;
    totalUsers : Nat;
    pendingApprovals : Nat;
    totalEnquiries : Nat;
  };

  // === Authorization & Storage Mixins ===
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // === Persistent State ===
  var propertyIdCounter = 0;
  var enquiryIdCounter = 0;
  var testimonialIdCounter = 0;

  let userApprovalState = UserApproval.initState(accessControlState);
  public type ApprovalStatus = UserApproval.ApprovalStatus;
  public type UserApprovalInfo = {
    principal : Principal;
    status : ApprovalStatus;
  };

  let users = Map.empty<Principal, User>();
  let properties = Map.empty<Nat, Property>();
  let enquiries = Map.empty<Nat, Enquiry>();
  let testimonials = Map.empty<Nat, Testimonial>();

  // === User Approval ===

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(userApprovalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(userApprovalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(userApprovalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(userApprovalState);
  };

  // === User Management ===

  public query ({ caller }) func getCallerUserProfile() : async {
    name : Text;
    email : Text;
    phone : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    switch (users.get(caller)) {
      case (?user) {
        {
          name = user.name;
          email = user.email;
          phone = user.phone;
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getUserProfile(target : Principal) : async {
    name : Text;
    email : Text;
    phone : Text;
  } {
    if (caller != target and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (users.get(target)) {
      case (?user) {
        {
          name = user.name;
          email = user.email;
          phone = user.phone;
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : {
    name : Text;
    email : Text;
    phone : Text;
  }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (users.get(caller)) {
      case (?existingUser) {
        let updatedUser : User = {
          principal = existingUser.principal;
          name = profile.name;
          email = profile.email;
          phone = profile.phone;
          role = existingUser.role;
          wishlist = existingUser.wishlist;
        };
        users.add(caller, updatedUser);
      };
      case (null) {
        let newUser : User = {
          principal = caller;
          name = profile.name;
          email = profile.email;
          phone = profile.phone;
          role = #user;
          wishlist = Set.empty<Nat>();
        };
        users.add(caller, newUser);
      };
    };
  };

  // Admin-only: assign a role to a user in the application user table
  public shared ({ caller }) func assignRole(user : Principal, role : Role) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };
    switch (users.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?existingUser) {
        let updatedUser = {
          principal = existingUser.principal;
          name = existingUser.name;
          email = existingUser.email;
          phone = existingUser.phone;
          role;
          wishlist = existingUser.wishlist;
        };
        users.add(user, updatedUser);
      };
    };
  };

  // === Property CRUD ===

  public query ({ caller }) func getProperty(id : Nat) : async Property {
    switch (properties.get(id)) {
      case (?p) { return p };
      case (null) {
        Runtime.trap("Property does not exist");
      };
    };
  };

  public query ({ caller }) func getProperties() : async [Property] {
    properties.values().toArray();
  };

  public query ({ caller }) func getFeaturedProperties() : async [Property] {
    properties.values().toArray().filter(
      func(p) { p.isFeatured }
    );
  };

  // New query for all for rent listings
  public query ({ caller }) func getForRentProperties() : async [Property] {
    properties.values().toArray().filter(
      func(p) { p.status == #rent }
    );
  };

  public shared ({ caller }) func createProperty(property : {
    title : Text;
    description : Text;
    price : Nat;
    location : Text;
    propertyType : PropertyType;
    bhkType : BhkType;
    carpetArea : Nat;
    builtUpArea : Nat;
    status : ListingStatus;
    isFeatured : Bool;
    isLuxury : Bool;
    isUnderConstruction : Bool;
  }) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create properties");
    };
    propertyIdCounter += 1;
    let newProperty : Property = {
      id = propertyIdCounter;
      owner = caller;
      title = property.title;
      description = property.description;
      price = property.price;
      location = property.location;
      propertyType = property.propertyType;
      bhkType = property.bhkType;
      carpetArea = property.carpetArea;
      builtUpArea = property.builtUpArea;
      amenities = [];
      images = [];
      status = property.status;
      isFeatured = property.isFeatured;
      isLuxury = property.isLuxury;
      isUnderConstruction = property.isUnderConstruction;
    };
    properties.add(propertyIdCounter, newProperty);
    propertyIdCounter;
  };

  public shared ({ caller }) func updateProperty(propertyId : Nat, update : {
    title : Text;
    description : Text;
    price : Nat;
    location : Text;
    propertyType : PropertyType;
    bhkType : BhkType;
    carpetArea : Nat;
    builtUpArea : Nat;
    status : ListingStatus;
    isLuxury : Bool;
    isUnderConstruction : Bool;
  }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update properties");
    };
    switch (properties.get(propertyId)) {
      case (null) { Runtime.trap("Property does not exist") };
      case (?currentProperty) {
        if (currentProperty.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can update this property");
        };
        let updatedProperty = {
          id = currentProperty.id;
          owner = currentProperty.owner;
          title = update.title;
          description = update.description;
          price = update.price;
          location = update.location;
          propertyType = update.propertyType;
          bhkType = update.bhkType;
          carpetArea = update.carpetArea;
          builtUpArea = update.builtUpArea;
          amenities = currentProperty.amenities;
          images = currentProperty.images;
          status = update.status;
          isFeatured = currentProperty.isFeatured;
          isLuxury = update.isLuxury;
          isUnderConstruction = update.isUnderConstruction;
        };
        properties.add(propertyId, updatedProperty);
      };
    };
  };

  public shared ({ caller }) func deleteProperty(propertyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete properties");
    };
    switch (properties.get(propertyId)) {
      case (null) { Runtime.trap("Property does not exist") };
      case (?currentProperty) {
        if (currentProperty.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can delete this property");
        };
        properties.remove(propertyId);
      };
    };
  };

  // Admin-only: approve/reject/feature a listing
  public shared ({ caller }) func setPropertyStatus(propertyId : Nat, status : ListingStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set property status");
    };
    switch (properties.get(propertyId)) {
      case (null) { Runtime.trap("Property does not exist") };
      case (?currentProperty) {
        let updatedProperty = {
          id = currentProperty.id;
          owner = currentProperty.owner;
          title = currentProperty.title;
          description = currentProperty.description;
          price = currentProperty.price;
          location = currentProperty.location;
          propertyType = currentProperty.propertyType;
          bhkType = currentProperty.bhkType;
          carpetArea = currentProperty.carpetArea;
          builtUpArea = currentProperty.builtUpArea;
          amenities = currentProperty.amenities;
          images = currentProperty.images;
          status;
          isFeatured = currentProperty.isFeatured;
          isLuxury = currentProperty.isLuxury;
          isUnderConstruction = currentProperty.isUnderConstruction;
        };
        properties.add(propertyId, updatedProperty);
      };
    };
  };

  // Admin-only: toggle featured flag
  public shared ({ caller }) func setPropertyFeatured(propertyId : Nat, isFeatured : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can feature properties");
    };
    switch (properties.get(propertyId)) {
      case (null) { Runtime.trap("Property does not exist") };
      case (?currentProperty) {
        let updatedProperty = {
          id = currentProperty.id;
          owner = currentProperty.owner;
          title = currentProperty.title;
          description = currentProperty.description;
          price = currentProperty.price;
          location = currentProperty.location;
          propertyType = currentProperty.propertyType;
          bhkType = currentProperty.bhkType;
          carpetArea = currentProperty.carpetArea;
          builtUpArea = currentProperty.builtUpArea;
          amenities = currentProperty.amenities;
          images = currentProperty.images;
          status = currentProperty.status;
          isFeatured;
          isLuxury = currentProperty.isLuxury;
          isUnderConstruction = currentProperty.isUnderConstruction;
        };
        properties.add(propertyId, updatedProperty);
      };
    };
  };

  public shared ({ caller }) func addAmenities(
    propertyId : Nat,
    amenities_ : [Amenity],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add amenities");
    };
    switch (properties.get(propertyId)) {
      case (null) { Runtime.trap("Property does not exist") };
      case (?currentProperty) {
        if (currentProperty.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can add amenities");
        };
        let updatedProperty = {
          id = currentProperty.id;
          owner = currentProperty.owner;
          title = currentProperty.title;
          description = currentProperty.description;
          price = currentProperty.price;
          location = currentProperty.location;
          propertyType = currentProperty.propertyType;
          bhkType = currentProperty.bhkType;
          carpetArea = currentProperty.carpetArea;
          builtUpArea = currentProperty.builtUpArea;
          amenities = amenities_;
          images = currentProperty.images;
          status = currentProperty.status;
          isFeatured = currentProperty.isFeatured;
          isLuxury = currentProperty.isLuxury;
          isUnderConstruction = currentProperty.isUnderConstruction;
        };
        properties.add(propertyId, updatedProperty);
      };
    };
  };

  // === Wishlist ===

  public shared ({ caller }) func addToWishlist(propertyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage their wishlist");
    };
    switch (users.get(caller)) {
      case (?user) {
        let newWishlist = user.wishlist.clone();
        newWishlist.add(propertyId);
        let updatedUser = {
          principal = user.principal;
          name = user.name;
          email = user.email;
          phone = user.phone;
          role = user.role;
          wishlist = newWishlist;
        };
        users.add(caller, updatedUser);
      };
      case (null) {
        Runtime.trap("User does not exist");
      };
    };
  };

  public shared ({ caller }) func removeFromWishlist(propertyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage their wishlist");
    };
    switch (users.get(caller)) {
      case (?user) {
        let newWishlist = user.wishlist.clone();
        newWishlist.remove(propertyId);
        let updatedUser = {
          principal = user.principal;
          name = user.name;
          email = user.email;
          phone = user.phone;
          role = user.role;
          wishlist = newWishlist;
        };
        users.add(caller, updatedUser);
      };
      case (null) {
        Runtime.trap("User does not exist");
      };
    };
  };

  public query ({ caller }) func getWishlist() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their wishlist");
    };
    switch (users.get(caller)) {
      case (null) {
        Runtime.trap("User does not exist");
      };
      case (?user) { user.wishlist.toArray() };
    };
  };

  // === Enquiries ===

  // Anyone (including guests) can submit an enquiry
  public shared ({ caller }) func createEnquiry(enquiry : {
    propertyId : Nat;
    senderName : Text;
    senderPhone : Text;
    senderEmail : Text;
    message : Text;
    timestamp : Int;
  }) : async Nat {
    enquiryIdCounter += 1;
    let newEnquiry : Enquiry = {
      id = enquiryIdCounter;
      propertyId = enquiry.propertyId;
      senderName = enquiry.senderName;
      senderPhone = enquiry.senderPhone;
      senderEmail = enquiry.senderEmail;
      message = enquiry.message;
      timestamp = enquiry.timestamp;
    };
    enquiries.add(enquiryIdCounter, newEnquiry);
    enquiryIdCounter;
  };

  // Admin-only: view all enquiries (contains personal contact data)
  public query ({ caller }) func getEnquiries() : async [Enquiry] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all enquiries");
    };
    enquiries.values().toArray();
  };

  // Get enquiries for a specific property — only the property owner or admin
  public query ({ caller }) func getEnquiriesForProperty(propertyId : Nat) : async [Enquiry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view enquiries");
    };
    switch (properties.get(propertyId)) {
      case (null) { Runtime.trap("Property does not exist") };
      case (?prop) {
        if (prop.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the property owner or an admin can view its enquiries");
        };
        enquiries.values().toArray().filter(func(e) { e.propertyId == propertyId });
      };
    };
  };

  // === Testimonials ===

  // Admin-only: create testimonials to prevent spam
  public shared ({ caller }) func createTestimonial(testimonial : {
    author : Text;
    quote : Text;
    rating : Nat;
  }) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create testimonials");
    };
    testimonialIdCounter += 1;
    let newTestimonial : Testimonial = {
      id = testimonialIdCounter;
      author = testimonial.author;
      quote = testimonial.quote;
      rating = testimonial.rating;
    };
    testimonials.add(testimonialIdCounter, newTestimonial);
    testimonialIdCounter;
  };

  // Public: anyone can view testimonials
  public query ({ caller }) func getTestimonials() : async [Testimonial] {
    testimonials.values().toArray();
  };

  // === Analytics (Admin only) ===

  public query ({ caller }) func getAnalyticsSummary() : async AnalyticsSummary {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    let allProperties = properties.values().toArray();
    let pendingCount = allProperties.filter(func(p) { p.status == #pending }).size();
    {
      totalProperties = allProperties.size();
      totalUsers = users.size();
      pendingApprovals = pendingCount;
      totalEnquiries = enquiries.size();
    };
  };

  // === Admin: User Management ===

  // Admin-only: list all users
  public query ({ caller }) func getAllUsers() : async [{
    principal : Principal;
    name : Text;
    email : Text;
    phone : Text;
    role : Role;
  }] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };
    users.values().toArray().map(func(u) {
      {
        principal = u.principal;
        name = u.name;
        email = u.email;
        phone = u.phone;
        role = u.role;
      }
    });
  };

  // === Sorting / Filtering (public) ===

  module PropertyModule {
    public func compareByPrice(a : Property, b : Property) : Order.Order {
      Nat.compare(a.price, b.price);
    };
  };

  public query ({ caller }) func getSortedPropertiesByPrice(_ascending : Bool) : async [Property] {
    properties.values().toArray().sort(PropertyModule.compareByPrice);
  };

  module PropertyLocation {
    public func compareByLocation(a : Property, b : Property) : Order.Order {
      Text.compare(a.location, b.location);
    };
  };

  public query ({ caller }) func getSortedPropertiesByLocation() : async [Property] {
    properties.values().toArray().sort(PropertyLocation.compareByLocation);
  };

  // Get own listings (authenticated users)
  public query ({ caller }) func getMyProperties() : async [Property] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their own listings");
    };
    properties.values().toArray().filter(func(p) { p.owner == caller });
  };
};
