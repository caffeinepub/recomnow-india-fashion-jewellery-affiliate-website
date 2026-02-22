import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  public type ProductStatus = {
    #active;
    #inactive;
  };

  public type ProductCategory = {
    #bottomWear;
    #chunnisDupattas;
    #dressMaterial;
    #gowns;
    #kurtasKurtis;
    #lehengaCholis;
    #salwarSuits;
    #sarees;
    #westernWear;
    #sportswear;
    #jewellery;
    #festive;
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
  var productCounter = 227;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();

  var sessions = Map.empty<Text, SessionInfo>();
  var sessionCounter : Nat = 0;

  var authenticatedAdmins = Map.empty<Principal, Bool>();

  var accessControlInitialized : Bool = false;

  public shared ({ caller }) func initializeAccessControl() : async () {
    if (accessControlInitialized) {
      Runtime.trap("Access control already initialized");
    };
    AccessControl.initialize(accessControlState, caller);
    accessControlInitialized := true;
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller) or isAuthenticatedAdmin(caller);
  };

  func isAuthenticatedAdmin(principal : Principal) : Bool {
    switch (authenticatedAdmins.get(principal)) {
      case (null) { false };
      case (?isAdmin) { isAdmin };
    };
  };

  func hasAdminPermission(caller : Principal) : Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or isAuthenticatedAdmin(caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or must be admin");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func validateSession(sessionToken : Text, caller : Principal) : Bool {
    switch (sessions.get(sessionToken)) {
      case (null) { false };
      case (?session) { session.principal == caller };
    };
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

  public query func getFashionProducts() : async [Product] {
    products.values().toArray().filter(
      func(product) {
        product.status == #active and (
          product.category == #bottomWear or
          product.category == #chunnisDupattas or
          product.category == #dressMaterial or
          product.category == #gowns or
          product.category == #kurtasKurtis or
          product.category == #lehengaCholis or
          product.category == #salwarSuits or
          product.category == #sarees or
          product.category == #westernWear or
          product.category == #sportswear
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

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
    id;
  };

  public shared ({ caller }) func updateProduct(id : Nat, input : ProductInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
      };
    };
  };

  public shared ({ caller }) func restoreProducts(productsToRestore : [Product]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can restore products");
    };

    for (product in productsToRestore.vals()) {
      products.add(product.id, product);
      if (product.id >= productCounter) {
        productCounter := product.id + 1;
      };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
