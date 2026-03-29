import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Category {
    name: string;
    description: string;
}
export interface PaymentSettings {
    bankAccountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
    upiId: string;
}
export interface CartItem {
    quantity: bigint;
    product: Product;
}
export interface OrderedItem {
    productName: string;
    quantity: bigint;
    price: bigint;
}
export interface Order {
    customerName: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    customerPhone: string;
    customer: Principal;
    orderedItems: Array<OrderedItem>;
    orderId: bigint;
    customerAddress: string;
    totalAmount: bigint;
}
export interface UserProfile {
    name: string;
}
export interface Product {
    inStock: boolean;
    originalPrice: bigint;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    rating: number;
    price: bigint;
    reviewCount: bigint;
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    processing = "processing"
}
export enum PaymentMethod {
    cashOnDelivery = "cashOnDelivery",
    prepaid = "prepaid"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(name: string, description: string): Promise<void>;
    addProduct(product: Product): Promise<bigint>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getCategories(): Promise<Array<Category>>;
    getCustomerOrders(customer: Principal): Promise<Array<Order>>;
    getOrder(orderId: bigint): Promise<Order>;
    getPaymentSettings(): Promise<PaymentSettings | null>;
    getProduct(productId: bigint): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(customerName: string, customerPhone: string, customerAddress: string, orderedItems: Array<OrderedItem>, totalAmount: bigint, paymentMethod: PaymentMethod): Promise<bigint>;
    removeFromCart(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(keyword: string): Promise<Array<Product>>;
    updateOrderStatus(orderId: bigint, newStatus: OrderStatus): Promise<void>;
    updatePaymentSettings(settings: PaymentSettings): Promise<void>;
    verifyAdminPasscode(code: string): Promise<boolean>;
    changeAdminPasscode(currentCode: string, newCode: string): Promise<boolean>;
}
