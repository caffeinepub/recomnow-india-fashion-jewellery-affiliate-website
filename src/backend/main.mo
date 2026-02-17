import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Array "mo:core/Array";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";



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

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.title, product2.title);
    };

    public func compareByPrice(product1 : Product, product2 : Product) : Order.Order {
      if (product1.price < product2.price) { #less } else if (product1.price > product2.price) {
        #greater;
      } else { compare(product1, product2) };
    };
  };

  public type BlogPost = {
    id : Nat;
    title : Text;
    content : Text;
    author : Text;
    createdAt : Int;
    isFeatured : Bool;
  };

  module BlogPost {
    public func compareByDate(b1 : BlogPost, b2 : BlogPost) : Order.Order {
      Int.compare(b2.createdAt, b1.createdAt);
    };
  };

  type NewsletterSignup = {
    email : Text;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  type SessionInfo = {
    principal : Principal;
    username : Text;
    createdAt : Int;
  };

  type PageContent = {
    title : Text;
    content : Text;
    lastModified : Int;
  };

  var products = Map.empty<Nat, Product>();
  var blogPosts = Map.empty<Nat, BlogPost>();
  var pageContents = Map.empty<Text, PageContent>();
  var productCounter = 0;
  var blogCounter = 0;

  var newsletterSignups = Map.empty<Text, NewsletterSignup>();
  var userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();

  var adminUsername = "admin";
  var adminPassword = "secureAdminPassword";

  var sessions = Map.empty<Text, SessionInfo>();
  var sessionCounter : Nat = 0;

  var authenticatedAdmins = Map.empty<Principal, Bool>();

  var accessControlInitialized : Bool = false;

  // New field for Google verification filename
  var googleVerificationFilename : ?Text = ?"googlec32c17dfce36326e.html";

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

  // Get, check or require admin rights (for current caller)
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

  // ========================== USER PROFILES ========================
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // GET single user profile, requires admin, returns own profile otherwise
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

  public shared ({ caller }) func login(username : Text, password : Text) : async Text {
    if (username != adminUsername or password != adminPassword) {
      Runtime.trap("Invalid credentials");
    };

    if (not accessControlInitialized) {
      AccessControl.initialize(accessControlState, caller);
      accessControlInitialized := true;
    };

    authenticatedAdmins.add(caller, true);

    let sessionToken = "session-" # sessionCounter.toText();
    sessionCounter += 1;

    let sessionInfo : SessionInfo = {
      principal = caller;
      username = username;
      createdAt = Time.now();
    };

    sessions.add(sessionToken, sessionInfo);
    sessionToken;
  };

  public shared ({ caller }) func logout(sessionToken : Text) : async () {
    switch (sessions.get(sessionToken)) {
      case (null) { Runtime.trap("No active session") };
      case (?session) {
        if (session.principal != caller) {
          Runtime.trap("Unauthorized: Cannot logout another user's session");
        };
        sessions.remove(sessionToken);
      };
    };
  };

  public query ({ caller }) func checkAuth(sessionToken : Text) : async Bool {
    switch (sessions.get(sessionToken)) {
      case (null) { false };
      case (?session) { session.principal == caller };
    };
  };

  func validateSession(sessionToken : Text, caller : Principal) : Bool {
    switch (sessions.get(sessionToken)) {
      case (null) { false };
      case (?session) { session.principal == caller };
    };
  };

  // ========================== PRODUCTS ========================

  public shared ({ caller }) func addProduct(
    sessionToken : Text,
    productInput : ProductInput,
  ) : async Product {
    if (not validateSession(sessionToken, caller)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    };

    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let newProduct : Product = {
      id = productCounter;
      title = productInput.title;
      description = productInput.description;
      imageUrl = productInput.imageUrl;
      imageBlob = null;
      affiliateLink = productInput.affiliateLink;
      category = productInput.category;
      price = productInput.price;
      discountPercentage = productInput.discountPercentage;
      mrp = productInput.mrp;
      isFeatured = productInput.isFeatured;
      createdAt = Time.now();
      status = #active;
    };

    products.add(productCounter, newProduct);
    productCounter += 1;
    newProduct;
  };

  public shared ({ caller }) func addProductWithImage(
    sessionToken : Text,
    productInput : ProductInput,
    imageBlob : Storage.ExternalBlob,
  ) : async Product {
    if (not validateSession(sessionToken, caller)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    };

    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let newProduct : Product = {
      id = productCounter;
      title = productInput.title;
      description = productInput.description;
      imageUrl = productInput.imageUrl;
      imageBlob = ?imageBlob;
      affiliateLink = productInput.affiliateLink;
      category = productInput.category;
      price = productInput.price;
      discountPercentage = productInput.discountPercentage;
      mrp = productInput.mrp;
      isFeatured = productInput.isFeatured;
      createdAt = Time.now();
      status = #active;
    };

    products.add(productCounter, newProduct);
    productCounter += 1;
    newProduct;
  };

  public query func getProductImage(productId : Nat) : async ?Storage.ExternalBlob {
    switch (products.get(productId)) {
      case (null) { null };
      case (?product) { product.imageBlob };
    };
  };

  public shared ({ caller }) func updateProduct(
    sessionToken : Text,
    id : Nat,
    productInput : ProductInput,
  ) : async Product {
    if (not validateSession(sessionToken, caller)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    };

    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existingProduct) {
        let updatedProduct : Product = {
          id;
          title = productInput.title;
          description = productInput.description;
          imageUrl = productInput.imageUrl;
          imageBlob = existingProduct.imageBlob;
          affiliateLink = productInput.affiliateLink;
          category = productInput.category;
          price = productInput.price;
          discountPercentage = productInput.discountPercentage;
          mrp = productInput.mrp;
          isFeatured = productInput.isFeatured;
          createdAt = existingProduct.createdAt;
          status = existingProduct.status;
        };
        products.add(id, updatedProduct);
        updatedProduct;
      };
    };
  };

  public shared ({ caller }) func deleteProduct(sessionToken : Text, id : Nat) : async () {
    if (not validateSession(sessionToken, caller)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    };

    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    if (not products.containsKey(id)) {
      Runtime.trap("Product does not exist");
    };

    products.remove(id);
  };

  public query func getProductById(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getProductForEdit(sessionToken : Text, id : Nat) : async ?Product {
    if (not validateSession(sessionToken, caller)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    };

    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can access product edit data");
    };

    products.get(id);
  };

  public query func searchProducts(searchTerm : Text) : async [Product] {
    products.values().toArray().filter(
      func(product) {
        product.status == #active and product.title.contains(#text searchTerm)
      }
    ).sort();
  };

  func filterProductsByDiscount(productsArray : [Product], minDiscount : Nat, maxDiscount : Nat) : [Product] {
    productsArray.filter(
      func(product) { product.discountPercentage >= minDiscount and product.discountPercentage <= maxDiscount }
    );
  };

  public query func getProductsByDiscountRange(minDiscount : Nat, maxDiscount : Nat) : async [Product] {
    let activeProducts = products.values().toArray().filter(
      func(product) {
        product.status == #active
      }
    );
    filterProductsByDiscount(activeProducts, minDiscount, maxDiscount);
  };

  public query func getActiveProducts() : async [Product] {
    products.values().toArray().filter(
      func(product) { product.status == #active }
    ).sort();
  };

  public query func getFeaturedProducts() : async [Product] {
    products.values().toArray().filter(
      func(product) {
        product.status == #active and product.isFeatured
      }
    ).sort();
  };

  public query func getProductsByCategory(category : ProductCategory) : async [Product] {
    products.values().toArray().filter(
      func(product) {
        product.status == #active and product.category == category
      }
    ).sort();
  };

  public query func getProductsByPriceRange(minPrice : Nat, maxPrice : Nat) : async [Product] {
    products.values().toArray().filter(
      func(product) {
        product.status == #active and product.price >= minPrice and product.price <= maxPrice
      }
    ).sort(Product.compareByPrice);
  };

  // ========================== BLOG POSTS ========================

  public shared ({ caller }) func addBlogPost(
    sessionToken : Text,
    title : Text,
    content : Text,
    author : Text,
    isFeatured : Bool,
  ) : async BlogPost {
    if (not validateSession(sessionToken, caller)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    };

    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can add blog posts");
    };

    let newBlogPost : BlogPost = {
      id = blogCounter;
      title;
      content;
      author;
      createdAt = Time.now();
      isFeatured;
    };

    blogPosts.add(blogCounter, newBlogPost);
    blogCounter += 1;
    newBlogPost;
  };

  public shared ({ caller }) func updateBlogPost(
    sessionToken : Text,
    id : Nat,
    title : Text,
    content : Text,
    author : Text,
    isFeatured : Bool,
  ) : async BlogPost {
    if (not validateSession(sessionToken, caller)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    };

    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can update blog posts");
    };

    switch (blogPosts.get(id)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?existingPost) {
        let updatedBlogPost : BlogPost = {
          id;
          title;
          content;
          author;
          createdAt = existingPost.createdAt;
          isFeatured;
        };
        blogPosts.add(id, updatedBlogPost);
        updatedBlogPost;
      };
    };
  };

  public shared ({ caller }) func deleteBlogPost(sessionToken : Text, id : Nat) : async () {
    if (not validateSession(sessionToken, caller)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    };

    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete blog posts");
    };

    if (not blogPosts.containsKey(id)) {
      Runtime.trap("Blog post does not exist");
    };

    blogPosts.remove(id);
  };

  public query func getBlogPosts() : async [BlogPost] {
    blogPosts.values().toArray().sort(BlogPost.compareByDate);
  };

  public query func getFeaturedBlogPosts() : async [BlogPost] {
    blogPosts.values().toArray().filter(func(post) { post.isFeatured }).sort(BlogPost.compareByDate);
  };

  public query func getBlogPostById(id : Nat) : async BlogPost {
    switch (blogPosts.get(id)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?post) { post };
    };
  };

  // ========================== NEWSLETTER ========================

  public shared ({ caller }) func subscribeNewsletter(email : Text) : async () {
    if (newsletterSignups.containsKey(email)) {
      Runtime.trap("Email already subscribed");
    };

    let signup : NewsletterSignup = {
      email;
      createdAt = Time.now();
    };

    newsletterSignups.add(email, signup);
  };

  public query ({ caller }) func getNewsletterSignups(sessionToken : Text) : async [NewsletterSignup] {
    if (not validateSession(sessionToken, caller)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    };

    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can view newsletter signups");
    };
    newsletterSignups.values().toArray();
  };

  public query func getSiteInfo() : async {
    siteName : Text;
    tagline : Text;
    categories : [Text];
    affiliateDisclaimer : Text;
  } {
    {
      siteName = "RecomNow India";
      tagline = "Your guide to chic fashion, costume jewellery, and trendsetting accessories";
      categories = [
        "Fashion",
        "Jewellery",
        "Festive",
        "Bottom Wear",
        "Chunnis & Dupattas",
        "Dress Material",
        "Gowns",
        "Kurtas & Kurtis",
        "Lehenga Cholis",
        "Salwar Suits",
        "Sarees",
        "Western Wear",
        "Sportswear",
      ];
      affiliateDisclaimer = "As an affiliate, RecomNow may earn from qualifying purchases.";
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray().filter(
      func(product) { product.status == #active }
    ).sort();
  };

  public query ({ caller }) func getProductCounter(sessionToken : Text) : async Nat {
    if (not validateSession(sessionToken, caller)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    };

    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can view product counter");
    };
    productCounter;
  };

  // ========================== PAGES ========================

  public shared ({ caller }) func updatePage(
    sessionToken : Text,
    pageKey : Text,
    title : Text,
    content : Text,
  ) : async () {
    if (not validateSession(sessionToken, caller)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    };

    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can update pages");
    };

    let pageContent : PageContent = {
      title;
      content;
      lastModified = Time.now();
    };

    pageContents.add(pageKey, pageContent);
  };

  public query func getPage(pageKey : Text) : async PageContent {
    switch (pageContents.get(pageKey)) {
      case (null) { Runtime.trap("Page not found") };
      case (?page) { page };
    };
  };

  public query ({ caller }) func getAllPages(sessionToken : Text) : async [(Text, PageContent)] {
    if (not validateSession(sessionToken, caller)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    };

    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all pages");
    };
    pageContents.toArray();
  };

  public shared ({ caller }) func bulkUpdatePages(
    sessionToken : Text,
    pages : [(Text, Text, Text)],
  ) : async () {
    if (not validateSession(sessionToken, caller)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    };

    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can update pages");
    };

    let updateIter = pages.values();
    updateIter.forEach(
      func(page) {
        switch (page) {
          case ((pageKey, title, content)) {
            let pageContent : PageContent = {
              title;
              content;
              lastModified = Time.now();
            };
            pageContents.add(pageKey, pageContent);
          };
        };
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
    ).sort();
  };

  // =================== GOOGLE SITE VERIFICATION ===================
  public query func getGoogleVerificationFilename() : async ?Text {
    googleVerificationFilename;
  };

  public shared ({ caller }) func setGoogleVerificationFilename(sessionToken : Text, filename : Text) : async () {
    if (not validateSession(sessionToken, caller)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    };
    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can update Google verification filename");
    };
    googleVerificationFilename := ?filename;
  };

  // =========================== SITEMAP ===========================

  public query func getSitemap() : async Text {
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" #
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n" #

    "  <url>\n" #
    "    <loc>https://recomnowindia-2gi.caffeine.xyz/</loc>\n" #
    "    <lastmod>2026-01-06</lastmod>\n" #
    "    <changefreq>daily</changefreq>\n" #
    "    <priority>1.0</priority>\n" #
    "  </url>\n" #

    "  <url>\n" #
    "    <loc>https://recomnowindia-2gi.caffeine.xyz/about</loc>\n" #
    "    <lastmod>2026-01-06</lastmod>\n" #
    "    <changefreq>monthly</changefreq>\n" #
    "    <priority>0.8</priority>\n" #
    "  </url>\n" #

    "  <url>\n" #
    "    <loc>https://recomnowindia-2gi.caffeine.xyz/contact</loc>\n" #
    "    <lastmod>2026-01-06</lastmod>\n" #
    "    <changefreq>monthly</changefreq>\n" #
    "    <priority>0.7</priority>\n" #
    "  </url>\n" #

    "  <url>\n" #
    "    <loc>https://recomnowindia-2gi.caffeine.xyz/products</loc>\n" #
    "    <lastmod>2026-01-06</lastmod>\n" #
    "    <changefreq>weekly</changefreq>\n" #
    "    <priority>0.9</priority>\n" #
    "  </url>\n" #

    "  <url>\n" #
    "    <loc>https://recomnowindia-2gi.caffeine.xyz/blog</loc>\n" #
    "    <lastmod>2026-01-06</lastmod>\n" #
    "    <changefreq>weekly</changefreq>\n" #
    "    <priority>0.7</priority>\n" #
    "  </url>\n" #
    "</urlset>";
  };

  // =========================== ROBOTS.txt ===========================

  public query func getRobotsTxt() : async Text {
    "User-agent: *\n" #
    "Disallow:\n" #
    "Sitemap: https://recomnowindia-2gi.caffeine.xyz/sitemap.xml\n";
  };
};

