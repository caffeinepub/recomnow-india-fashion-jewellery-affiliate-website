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
export interface UserProfile {
    name: string;
}
export interface ProductInput {
    mrp: bigint;
    title: string;
    description?: string;
    imageUrl: string;
    isFeatured: boolean;
    category: ProductCategory;
    affiliateLink: string;
    price: bigint;
    discountPercentage: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Product {
    id: bigint;
    mrp: bigint;
    status: ProductStatus;
    title: string;
    imageBlob?: ExternalBlob;
    createdAt: bigint;
    description?: string;
    imageUrl: string;
    isFeatured: boolean;
    category: ProductCategory;
    affiliateLink: string;
    price: bigint;
    discountPercentage: bigint;
}
export enum ProductCategory {
    jewellery = "jewellery",
    sarees = "sarees",
    bottomWear = "bottomWear",
    dressMaterial = "dressMaterial",
    festive = "festive",
    kurtasKurtis = "kurtasKurtis",
    gowns = "gowns",
    salwarSuits = "salwarSuits",
    sportswear = "sportswear",
    lehengaCholis = "lehengaCholis",
    chunnisDupattas = "chunnisDupattas",
    westernWear = "westernWear"
}
export enum ProductStatus {
    active = "active",
    inactive = "inactive"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(input: ProductInput): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    filterProducts(category: ProductCategory | null, minPrice: bigint | null, maxPrice: bigint | null, minDiscount: bigint | null, maxDiscount: bigint | null): Promise<Array<Product>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFashionProducts(): Promise<Array<Product>>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getProductById(id: bigint): Promise<Product>;
    getProductCounter(): Promise<bigint>;
    getProductsByCategory(category: ProductCategory): Promise<Array<Product>>;
    getProductsByDiscountRange(minDiscount: bigint, maxDiscount: bigint): Promise<Array<Product>>;
    getProductsByPriceRange(minPrice: bigint, maxPrice: bigint): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    restoreProducts(productsToRestore: Array<Product>): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateProduct(id: bigint, input: ProductInput): Promise<void>;
}
