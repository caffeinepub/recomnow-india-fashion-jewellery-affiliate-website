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
export interface NewsletterSignup {
    createdAt: bigint;
    email: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface BlogPost {
    id: bigint;
    title: string;
    content: string;
    createdAt: bigint;
    author: string;
    isFeatured: boolean;
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
export interface PageContent {
    title: string;
    content: string;
    lastModified: bigint;
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
    addBlogPost(sessionToken: string, title: string, content: string, author: string, isFeatured: boolean): Promise<BlogPost>;
    addProduct(sessionToken: string, productInput: ProductInput): Promise<Product>;
    addProductWithImage(sessionToken: string, productInput: ProductInput, imageBlob: ExternalBlob): Promise<Product>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkUpdatePages(sessionToken: string, pages: Array<[string, string, string]>): Promise<void>;
    checkAuth(sessionToken: string): Promise<boolean>;
    deleteBlogPost(sessionToken: string, id: bigint): Promise<void>;
    deleteProduct(sessionToken: string, id: bigint): Promise<void>;
    filterProducts(category: ProductCategory | null, minPrice: bigint | null, maxPrice: bigint | null, minDiscount: bigint | null, maxDiscount: bigint | null): Promise<Array<Product>>;
    getActiveProducts(): Promise<Array<Product>>;
    getAllPages(sessionToken: string): Promise<Array<[string, PageContent]>>;
    getAllProducts(): Promise<Array<Product>>;
    getBlogPostById(id: bigint): Promise<BlogPost>;
    getBlogPosts(): Promise<Array<BlogPost>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFashionProducts(): Promise<Array<Product>>;
    getFeaturedBlogPosts(): Promise<Array<BlogPost>>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getGoogleVerificationFilename(): Promise<string | null>;
    getNewsletterSignups(sessionToken: string): Promise<Array<NewsletterSignup>>;
    getPage(pageKey: string): Promise<PageContent>;
    getProductById(id: bigint): Promise<Product>;
    getProductCounter(sessionToken: string): Promise<bigint>;
    getProductForEdit(sessionToken: string, id: bigint): Promise<Product | null>;
    getProductImage(productId: bigint): Promise<ExternalBlob | null>;
    getProductsByCategory(category: ProductCategory): Promise<Array<Product>>;
    getProductsByDiscountRange(minDiscount: bigint, maxDiscount: bigint): Promise<Array<Product>>;
    getProductsByPriceRange(minPrice: bigint, maxPrice: bigint): Promise<Array<Product>>;
    getRobotsTxt(): Promise<string>;
    getSiteInfo(): Promise<{
        categories: Array<string>;
        tagline: string;
        siteName: string;
        affiliateDisclaimer: string;
    }>;
    getSitemap(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    login(username: string, password: string): Promise<string>;
    logout(sessionToken: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    setGoogleVerificationFilename(sessionToken: string, filename: string): Promise<void>;
    subscribeNewsletter(email: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateBlogPost(sessionToken: string, id: bigint, title: string, content: string, author: string, isFeatured: boolean): Promise<BlogPost>;
    updatePage(sessionToken: string, pageKey: string, title: string, content: string): Promise<void>;
    updateProduct(sessionToken: string, id: bigint, productInput: ProductInput): Promise<Product>;
}
