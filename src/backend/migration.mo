import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type OldActor = {
    adminPassword : Text;
    adminUsername : Text;
    blogCounter : Nat;
    blogPosts : Map.Map<Nat, {
      id : Nat;
      title : Text;
      content : Text;
      author : Text;
      createdAt : Int;
      isFeatured : Bool;
    }>;
    googleVerificationFilename : ?Text;
    newsletterSignups : Map.Map<Text, {
      email : Text;
      createdAt : Int;
    }>;
    pageContents : Map.Map<Text, {
      title : Text;
      content : Text;
      lastModified : Int;
    }>;
    products : Map.Map<Nat, {
      id : Nat;
      title : Text;
      description : ?Text;
      imageUrl : Text;
      imageBlob : ?Storage.ExternalBlob;
      affiliateLink : Text;
      category : {
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
      price : Nat;
      isFeatured : Bool;
      discountPercentage : Nat;
      mrp : Nat;
      createdAt : Int;
      status : {
        #active;
        #inactive;
      };
    }>;
  };

  type Product = {
    id : Nat;
    title : Text;
    description : ?Text;
    imageUrl : Text;
    imageBlob : ?Storage.ExternalBlob;
    affiliateLink : Text;
    category : {
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
    price : Nat;
    isFeatured : Bool;
    discountPercentage : Nat;
    mrp : Nat;
    createdAt : Int;
    status : {
      #active;
      #inactive;
    };
  };

  type NewActor = {
    products : Map.Map<Nat, Product>;
  };

  public func run(old : OldActor) : NewActor {
    { products = old.products };
  };
};
