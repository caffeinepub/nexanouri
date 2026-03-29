import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";

import Order "mo:core/Order";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  // Integrate persistent access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let categories = Map.empty<Text, Category>();
  let products = Map.empty<Nat, Product>();
  let carts = Map.empty<Principal, Cart>();
  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextProductId = 0;
  var nextOrderId = 0;
  var paymentSettings : ?PaymentSettings = null;
  stable var adminPasscode : Text = "903731";

  public type UserProfile = {
    name : Text;
  };

  type Category = {
    name : Text;
    description : Text;
  };

  type Product = {
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    imageUrl : Text;
    rating : Float;
    reviewCount : Nat;
    originalPrice : Nat;
    inStock : Bool;
  };

  type CartItem = {
    product : Product;
    quantity : Nat;
  };

  type Cart = List.List<CartItem>;

  module CartItem {
    public func compare(cartItem1 : CartItem, cartItem2 : CartItem) : Order.Order {
      Nat.compare(cartItem1.quantity, cartItem2.quantity);
    };
  };

  type PaymentSettings = {
    upiId : Text;
    accountHolderName : Text;
    bankAccountNumber : Text;
    ifscCode : Text;
    bankName : Text;
  };

  type PaymentMethod = {
    #cashOnDelivery;
    #prepaid;
  };

  type OrderStatus = {
    #pending;
    #processing;
    #shipped;
    #delivered;
    #cancelled;
  };

  type OrderedItem = {
    productName : Text;
    price : Nat;
    quantity : Nat;
  };

  type Order = {
    orderId : Nat;
    customerName : Text;
    customerPhone : Text;
    customerAddress : Text;
    orderedItems : [OrderedItem];
    totalAmount : Nat;
    paymentMethod : PaymentMethod;
    status : OrderStatus;
    customer : Principal;
  };

  // Admin Passcode Management
  public func verifyAdminPasscode(code : Text) : async Bool {
    Text.equal(code, adminPasscode);
  };

  public func changeAdminPasscode(currentCode : Text, newCode : Text) : async Bool {
    if (not Text.equal(currentCode, adminPasscode)) {
      return false;
    };
    if (newCode.size() < 4) {
      return false;
    };
    adminPasscode := newCode;
    true;
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Category Management
  public shared ({ caller }) func addCategory(name : Text, description : Text) : async () {
    let category : Category = {
      name;
      description;
    };
    categories.add(name, category);
  };

  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray();
  };

  // Product Management
  public shared ({ caller }) func addProduct(product : Product) : async Nat {
    let productId = nextProductId;
    products.add(productId, product);
    nextProductId += 1;
    productId;
  };

  public query ({ caller }) func getProduct(productId : Nat) : async ?Product {
    products.get(productId);
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func searchProducts(keyword : Text) : async [Product] {
    products.values().toArray().filter(
      func(prod) {
        prod.name.contains(#text keyword) or prod.description.contains(#text keyword)
      }
    );
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(
      func(prod) { Text.equal(prod.category, category) }
    );
  };

  // Cart Management
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found.") };
      case (?product) {
        let cart = switch (carts.get(caller)) {
          case (null) { List.empty<CartItem>() };
          case (?cart) { cart };
        };

        var itemUpdated = false;
        let updatedCart = cart.map<CartItem, CartItem>(
          func(item) {
            if (Nat.equal(item.product.price, product.price)) {
              itemUpdated := true;
              {
                item with quantity = item.quantity + quantity;
              };
            } else { item };
          }
        );

        if (itemUpdated) {
          carts.add(caller, updatedCart);
          return;
        };

        let newCart = List.fromArray<CartItem>(cart.toArray());
        newCart.add({ product; quantity });
        carts.add(caller, newCart);
      };
    };
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };

    switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found.") };
      case (?cart) {
        let updatedCartArray = cart.toArray().filter(
          func(item) { not Nat.equal(item.product.price, productId) }
        );
        let updatedCart = List.fromArray<CartItem>(updatedCartArray);
        carts.add(caller, updatedCart);
      };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    carts.remove(caller);
  };

  // Payment Settings Management
  public shared ({ caller }) func updatePaymentSettings(settings : PaymentSettings) : async () {
    paymentSettings := ?settings;
  };

  public query ({ caller }) func getPaymentSettings() : async ?PaymentSettings {
    paymentSettings;
  };

  // Order Management
  public shared ({ caller }) func placeOrder(
    customerName : Text,
    customerPhone : Text,
    customerAddress : Text,
    orderedItems : [OrderedItem],
    totalAmount : Nat,
    paymentMethod : PaymentMethod,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let orderId = nextOrderId;
    let order : Order = {
      orderId;
      customerName;
      customerPhone;
      customerAddress;
      orderedItems;
      totalAmount;
      paymentMethod;
      status = #pending;
      customer = caller;
    };
    orders.add(orderId, order);
    nextOrderId += 1;

    // Clear cart after placing order
    carts.remove(caller);
    orderId;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : OrderStatus) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found.") };
      case (?order) {
        let updatedOrder = { order with status = newStatus };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async Order {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found.") };
      case (?order) {
        order;
      };
    };
  };

  public query ({ caller }) func getCustomerOrders(customer : Principal) : async [Order] {
    if (not Principal.equal(caller, customer) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    let customerOrders = List.empty<Order>();
    for (order in orders.values()) {
      if (Principal.equal(order.customer, customer)) {
        customerOrders.add(order);
      };
    };
    customerOrders.toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray();
  };
};
