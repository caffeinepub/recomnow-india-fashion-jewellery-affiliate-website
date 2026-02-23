import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Debug "mo:core/Debug";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

// No migration code necessary!

actor {
  include MixinStorage();

  public type ProductStatus = {
    #active;
    #inactive;
  };

  public type ProductCategory = {
    #fashion : FashionCategory;
    #jewellery : JewelleryCategory;
  };

  public type FashionCategory = {
    #sarees;
    #kurtaKurtis;
    #festive;
    #gowns;
    #salwarSuits;
    #lehengaCholis;
    #westernWear;
    #sportsWear;
  };

  public type JewelleryCategory = {
    #rings;
    #necklaces;
  };

  public type Product = {
    id : Nat;
    title : Text;
    description : ?Text;
    imageUrl : Text;
    imageBlob : ?Storage.ExternalBlob;
    affiliateLink : Text;
    category : ProductCategory;
    price : Nat;
    isFeatured : Bool;
    discountPercentage : Nat;
    mrp : Nat;
    createdAt : Int;
    status : ProductStatus;
  };

  public type ProductInput = {
    title : Text;
    description : ?Text;
    imageUrl : Text;
    affiliateLink : Text;
    category : ProductCategory;
    price : Nat;
    isFeatured : Bool;
    discountPercentage : Nat;
    mrp : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  type SessionInfo = {
    principal : Principal;
    username : Text;
    createdAt : Int;
    expiresAt : Int;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      return product1.title.compare(product2.title);
    };

    public func comparePrice(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.price, product2.price);
    };
  };

  let products = Map.empty<Nat, Product>();
  var productCounter = 227 : Nat;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();

  var sessions = Map.empty<Text, SessionInfo>();
  var users = Map.empty<Text, Text>();
  let userPrincipals = Map.empty<Text, Principal>();
  var sessionCounter : Nat = 0;

  var accessControlInitialized : Bool = false;
  var adminPrincipal : ?Principal = null;

  let SESSION_DURATION : Int = 24 * 60 * 60 * 1_000_000_000; // 24 hours in nanoseconds

  public shared ({ caller }) func initializeAccessControl() : async () {
    if (accessControlInitialized) {
      Runtime.trap("Access control already initialized");
    };
    AccessControl.initialize(accessControlState, caller);
    accessControlInitialized := true;
    adminPrincipal := ?caller;
    Debug.print("Access control initialized with admin principal: " # caller.toText());
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func _debugIsAdmin(callerPrincipal : Principal) : async Bool {
    AccessControl.isAdmin(accessControlState, callerPrincipal);
  };

  func hasAdminPermission(caller : Principal) : Bool {
    let hasPermission = AccessControl.hasPermission(accessControlState, caller, #admin);
    Debug.print("hasAdminPermission check for principal " # caller.toText() # ": " # debug_show(hasPermission));
    hasPermission;
  };

  func getPrincipalFromSession(sessionToken : Text) : ?Principal {
    switch (sessions.get(sessionToken)) {
      case (null) { 
        Debug.print("Session not found for token: " # sessionToken);
        null 
      };
      case (?session) {
        let now = Time.now();
        if (now < session.expiresAt) {
          Debug.print("Session found for token, principal: " # session.principal.toText() # ", username: " # session.username);
          ?session.principal;
        } else {
          Debug.print("Session expired for token: " # sessionToken);
          null;
        };
      };
    };
  };

  public shared ({ caller }) func addUser(username : Text, password : Text) : async () {
    Debug.print("addUser called for username: " # username # " by principal: " # caller.toText());
    
    if (username == "admin") {
      Runtime.trap("`admin` username is reserved");
    };

    switch (users.get(username)) {
      case (?_) {
        Runtime.trap("User already exists");
      };
      case (null) {
        users.add(username, password);
        userPrincipals.add(username, caller);

        // Initialize access control if not done yet
        if (not accessControlInitialized) {
          AccessControl.initialize(accessControlState, caller);
          accessControlInitialized := true;
          adminPrincipal := ?caller;
          Debug.print("Access control initialized during user registration with admin: " # caller.toText());
        };
        
        Debug.print("User registered: " # username # " with principal: " # caller.toText());
      };
    };
  };

  public shared ({ caller }) func removeUser(username : Text) : async () {
    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can remove users");
    };

    if (username == "admin") {
      Runtime.trap("Cannot remove default admin user");
    };

    users.remove(username);
    userPrincipals.remove(username);
  };

  public shared ({ caller }) func authenticateUser(username : Text, password : Text) : async ?Text {
    Debug.print("authenticateUser called for username: " # username # " by principal: " # caller.toText());
    
    switch (users.get(username)) {
      case (null) {
        Debug.print("User not found: " # username);
        null;
      };
      case (?storedPassword) {
        if (storedPassword == password) {
          let sessionToken = username.concat(sessionCounter.toText());
          sessionCounter += 1;

          let now = Time.now();
          let session : SessionInfo = {
            principal = caller;
            username = username;
            createdAt = now;
            expiresAt = now + SESSION_DURATION;
          };

          sessions.add(sessionToken, session);

          // If authenticating as "admin" username, grant admin role
          if (username == "admin") {
            if (not accessControlInitialized) {
              AccessControl.initialize(accessControlState, caller);
              accessControlInitialized := true;
              adminPrincipal := ?caller;
              Debug.print("Access control initialized during admin login with principal: " # caller.toText());
            } else {
              // Grant admin role to this principal if not already admin
              switch (adminPrincipal) {
                case (?adminP) {
                  // Use the existing admin to assign role
                  AccessControl.assignRole(accessControlState, adminP, caller, #admin);
                  Debug.print("Admin role assigned to principal: " # caller.toText());
                };
                case (null) {
                  // Fallback: initialize with this caller
                  AccessControl.initialize(accessControlState, caller);
                  accessControlInitialized := true;
                  adminPrincipal := ?caller;
                  Debug.print("Access control initialized (fallback) with admin: " # caller.toText());
                };
              };
            };
          };

          Debug.print("Authentication successful for " # username # ", session token: " # sessionToken);
          ?sessionToken;
        } else {
          Debug.print("Invalid password for user: " # username);
          null;
        };
      };
    };
  };

  public shared ({ caller }) func logout(sessionToken : Text) : async () {
    switch (sessions.get(sessionToken)) {
      case (null) {};
      case (?session) {
        if (session.principal == caller) {
          sessions.remove(sessionToken);
          Debug.print("User logged out: " # session.username);
        };
      };
    };
  };

  func validateSession(sessionToken : Text, caller : Principal) : Bool {
    switch (sessions.get(sessionToken)) {
      case (null) { 
        Debug.print("Session not found: " # sessionToken);
        false 
      };
      case (?session) {
        let now = Time.now();
        if (session.principal == caller and now < session.expiresAt) {
          Debug.print("Session valid for user: " # session.username);
          true;
        } else {
          if (now >= session.expiresAt) {
            sessions.remove(sessionToken);
            Debug.print("Session expired and removed: " # sessionToken);
          } else {
            Debug.print("Session principal mismatch");
          };
          false;
        };
      };
    };
  };

  public shared ({ caller }) func cleanupExpiredSessions() : async Nat {
    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can cleanup sessions");
    };

    let now = Time.now();
    var removedCount = 0;

    for ((token, session) in sessions.entries()) {
      if (now >= session.expiresAt) {
        sessions.remove(token);
        removedCount += 1;
      };
    };

    Debug.print("Cleaned up " # removedCount.toText() # " expired sessions");
    removedCount;
  };

  func isRegisteredUser(caller : Principal) : Bool {
    for ((username, principal) in userPrincipals.entries()) {
      if (principal == caller) {
        return true;
      };
    };
    false;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    // Allow registered users to get their profile, even if not explicitly assigned #user role
    if (not isRegisteredUser(caller) and not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    // Allow registered users to save their profile, even if not explicitly assigned #user role
    if (not isRegisteredUser(caller) and not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query func getProductById(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  func filterProductsByDiscount(productsArray : [Product], minDiscount : Nat, maxDiscount : Nat) : [Product] {
    productsArray.filter(
      func(product) { product.discountPercentage >= minDiscount and product.discountPercentage <= maxDiscount }
    );
  };

  public query func getFeaturedProducts() : async [Product] {
    products.values().toArray().filter(
      func(product) {
        product.status == #active and product.isFeatured
      }
    );
  };

  public query func getProductsByCategory(category : ProductCategory) : async [Product] {
    products.values().toArray().filter(
      func(product) {
        product.status == #active and product.category == category
      }
    );
  };

  public query func getProductsByPriceRange(minPrice : Nat, maxPrice : Nat) : async [Product] {
    products.values().toArray().filter(
      func(product) {
        product.status == #active and product.price >= minPrice and product.price <= maxPrice
      }
    ).sort(Product.comparePrice);
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray().filter(
      func(product) { product.status == #active }
    );
  };

  public query func getProductCounter() : async Nat {
    productCounter;
  };

  public query func getProductsByDiscountRange(minDiscount : Nat, maxDiscount : Nat) : async [Product] {
    let activeProducts = products.values().toArray().filter(
      func(product) {
        product.status == #active
      }
    );
    filterProductsByDiscount(activeProducts, minDiscount, maxDiscount);
  };

  public query func getFashionProducts(category : FashionCategory) : async [Product] {
    products.values().toArray().filter(
      func(product) {
        product.status == #active and (
          switch (product.category) {
            case (#fashion(cat)) { cat == category };
            case (#jewellery(_)) { false };
          }
        );
      }
    );
  };

  public query func searchProducts(searchTerm : Text) : async [Product] {
    products.values().toArray().filter(
      func(product) {
        product.status == #active and product.title.contains(#text searchTerm)
      }
    );
  };

  public query func filterProducts(
    category : ?ProductCategory,
    minPrice : ?Nat,
    maxPrice : ?Nat,
    minDiscount : ?Nat,
    maxDiscount : ?Nat,
  ) : async [Product] {
    let activeProducts = products.values().toArray().filter(
      func(product) { product.status == #active }
    );

    let filteredByCategory = switch (category) {
      case (null) { activeProducts };
      case (?cat) {
        activeProducts.filter(
          func(product) { product.category == cat }
        );
      };
    };

    let filteredByPrice = switch (minPrice, maxPrice) {
      case (null, null) { filteredByCategory };
      case (?min, null) {
        filteredByCategory.filter(
          func(product) { product.price >= min }
        );
      };
      case (null, ?max) {
        filteredByCategory.filter(
          func(product) { product.price <= max }
        );
      };
      case (?min, ?max) {
        filteredByCategory.filter(
          func(product) { product.price >= min and product.price <= max }
        );
      };
    };

    let filteredByDiscount = switch (minDiscount, maxDiscount) {
      case (null, null) { filteredByPrice };
      case (?min, null) {
        filteredByPrice.filter(
          func(product) { product.discountPercentage >= min }
        );
      };
      case (null, ?max) {
        filteredByPrice.filter(
          func(product) { product.discountPercentage <= max }
        );
      };
      case (?min, ?max) {
        filteredByPrice.filter(
          func(product) { product.discountPercentage >= min and product.discountPercentage <= max }
        );
      };
    };

    filteredByDiscount;
  };

  public shared ({ caller }) func addProduct(input : ProductInput) : async Nat {
    Debug.print("=== addProduct Authorization Check ===");
    Debug.print("Called by principal: " # caller.toText());
    Debug.print("Access control initialized: " # debug_show(accessControlInitialized));
    
    let userRole = AccessControl.getUserRole(accessControlState, caller);
    Debug.print("User role from AccessControl: " # debug_show(userRole));
    
    let isAdminCheck = AccessControl.isAdmin(accessControlState, caller);
    Debug.print("isAdmin check result: " # debug_show(isAdminCheck));
    
    let hasPermissionCheck = AccessControl.hasPermission(accessControlState, caller, #admin);
    Debug.print("hasPermission(#admin) check result: " # debug_show(hasPermissionCheck));
    
    if (not hasPermissionCheck) {
      Debug.print("Authorization FAILED: User does not have admin permission");
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    Debug.print("Authorization SUCCESSFUL: Proceeding to add product");
    Debug.print("Product title: " # input.title);

    let id = productCounter;
    productCounter += 1;

    let product : Product = {
      id = id;
      title = input.title;
      description = input.description;
      imageUrl = input.imageUrl;
      imageBlob = null;
      affiliateLink = input.affiliateLink;
      category = input.category;
      price = input.price;
      isFeatured = input.isFeatured;
      discountPercentage = input.discountPercentage;
      mrp = input.mrp;
      createdAt = Time.now();
      status = #active;
    };

    products.add(id, product);
    Debug.print("Product added successfully with id: " # id.toText());
    Debug.print("=== End addProduct ===");
    id;
  };

  public shared ({ caller }) func updateProduct(id : Nat, input : ProductInput) : async () {
    Debug.print("updateProduct called by principal: " # caller.toText() # " for product id: " # id.toText());
    
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.print("Authorization failed: User is not admin");
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existingProduct) {
        let updatedProduct : Product = {
          id = existingProduct.id;
          title = input.title;
          description = input.description;
          imageUrl = input.imageUrl;
          imageBlob = existingProduct.imageBlob;
          affiliateLink = input.affiliateLink;
          category = input.category;
          price = input.price;
          isFeatured = input.isFeatured;
          discountPercentage = input.discountPercentage;
          mrp = input.mrp;
          createdAt = existingProduct.createdAt;
          status = existingProduct.status;
        };
        products.add(id, updatedProduct);
        Debug.print("Product updated successfully: " # id.toText());
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    Debug.print("deleteProduct called by principal: " # caller.toText() # " for product id: " # id.toText());
    
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.print("Authorization failed: User is not admin");
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct : Product = {
          id = product.id;
          title = product.title;
          description = product.description;
          imageUrl = product.imageUrl;
          imageBlob = product.imageBlob;
          affiliateLink = product.affiliateLink;
          category = product.category;
          price = product.price;
          isFeatured = product.isFeatured;
          discountPercentage = product.discountPercentage;
          mrp = product.mrp;
          createdAt = product.createdAt;
          status = #inactive;
        };
        products.add(id, updatedProduct);
        Debug.print("Product deleted (marked inactive) successfully: " # id.toText());
      };
    };
  };

  public shared ({ caller }) func restoreProducts(productsToRestore : [Product]) : async () {
    Debug.print("restoreProducts called by principal: " # caller.toText());
    
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.print("Authorization failed: User is not admin");
      Runtime.trap("Unauthorized: Only admins can restore products");
    };

    for (product in productsToRestore.vals()) {
      products.add(product.id, product);
      if (product.id >= productCounter) {
        productCounter := product.id + 1;
      };
    };
    
    Debug.print("Products restored successfully, count: " # productsToRestore.size().toText());
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
