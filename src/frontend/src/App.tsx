import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Gem,
  MapPin,
  Menu,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { CartItem, Product } from "./backend";
import AdminPanel from "./components/AdminPanel";
import ChatWidget from "./components/ChatWidget";
import CheckoutModal from "./components/CheckoutModal";
import { useActor } from "./hooks/useActor";
import {
  useAddToCart,
  useGetCart,
  useGetProducts,
  useRemoveFromCart,
  useSearchProducts,
} from "./hooks/useQueries";

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_CATEGORIES = [
  "All",
  "Necklaces",
  "Rings",
  "Earrings",
  "Bracelets",
  "Men's",
  "Deals",
  "New Arrivals",
  "Gifting",
];

const CATEGORY_DATA = [
  { name: "Necklaces", image: "/assets/generated/necklace1.dim_400x400.jpg" },
  { name: "Rings", image: "/assets/generated/ring1.dim_400x400.jpg" },
  { name: "Earrings", image: "/assets/generated/earring1.dim_400x400.jpg" },
  { name: "Bracelets", image: "/assets/generated/bracelet1.dim_400x400.jpg" },
  { name: "Men's", image: "/assets/generated/mens1.dim_400x400.jpg" },
];

const MOCK_PRODUCTS: Product[] = [
  {
    name: "Gold Kundan Necklace Set",
    description:
      "Stunning traditional Kundan necklace with earrings, crafted in 22K gold plating with intricate stone work",
    imageUrl: "/assets/generated/necklace1.dim_400x400.jpg",
    category: "Necklaces",
    price: 249900n,
    originalPrice: 499900n,
    rating: 4.5,
    reviewCount: 1284n,
    inStock: true,
  },
  {
    name: "Diamond Solitaire Ring",
    description:
      "Elegant certified diamond solitaire ring in 18K white gold, perfect for engagements",
    imageUrl: "/assets/generated/ring1.dim_400x400.jpg",
    category: "Rings",
    price: 399900n,
    originalPrice: 599900n,
    rating: 4.7,
    reviewCount: 856n,
    inStock: true,
  },
  {
    name: "Gold Hoop Earrings",
    description:
      "Classic lightweight gold hoop earrings in 18K gold plating for everyday elegance",
    imageUrl: "/assets/generated/earring1.dim_400x400.jpg",
    category: "Earrings",
    price: 89900n,
    originalPrice: 149900n,
    rating: 4.4,
    reviewCount: 2341n,
    inStock: true,
  },
  {
    name: "Gemstone Tennis Bracelet",
    description:
      "Sparkling multicolor gemstone tennis bracelet with secure clasp, elegant for parties",
    imageUrl: "/assets/generated/bracelet1.dim_400x400.jpg",
    category: "Bracelets",
    price: 179900n,
    originalPrice: 299900n,
    rating: 4.3,
    reviewCount: 734n,
    inStock: true,
  },
  {
    name: "Men's Gold Chain",
    description:
      "Bold 22K gold plated Cuban link chain for men, 20-inch length with lobster clasp",
    imageUrl: "/assets/generated/mens1.dim_400x400.jpg",
    category: "Men's",
    price: 299900n,
    originalPrice: 449900n,
    rating: 4.6,
    reviewCount: 567n,
    inStock: true,
  },
  {
    name: "Pearl Pendant Necklace",
    description:
      "Freshwater pearl pendant on 925 sterling silver chain, timeless classic for modern women",
    imageUrl: "/assets/generated/necklace1.dim_400x400.jpg",
    category: "Necklaces",
    price: 129900n,
    originalPrice: 249900n,
    rating: 4.5,
    reviewCount: 1823n,
    inStock: true,
  },
  {
    name: "Silver Band Ring",
    description:
      "Minimalist 925 sterling silver band ring with brushed finish, stackable and versatile",
    imageUrl: "/assets/generated/ring1.dim_400x400.jpg",
    category: "Rings",
    price: 59900n,
    originalPrice: 99900n,
    rating: 4.2,
    reviewCount: 4521n,
    inStock: true,
  },
  {
    name: "Diamond Drop Earrings",
    description:
      "Dazzling diamond drop earrings in rose gold plating, perfect for weddings",
    imageUrl: "/assets/generated/earring1.dim_400x400.jpg",
    category: "Earrings",
    price: 249900n,
    originalPrice: 399900n,
    rating: 4.8,
    reviewCount: 392n,
    inStock: true,
  },
  {
    name: "Gold Charm Bracelet",
    description:
      "Delicate gold charm bracelet with 5 lucky charms, adjustable fits all wrist sizes",
    imageUrl: "/assets/generated/bracelet1.dim_400x400.jpg",
    category: "Bracelets",
    price: 99900n,
    originalPrice: 179900n,
    rating: 4.4,
    reviewCount: 1102n,
    inStock: true,
  },
  {
    name: "Men's Silver Bracelet",
    description:
      "Masculine 925 sterling silver link bracelet for men, heavy duty with magnetic clasp",
    imageUrl: "/assets/generated/mens1.dim_400x400.jpg",
    category: "Men's",
    price: 79900n,
    originalPrice: 129900n,
    rating: 4.3,
    reviewCount: 678n,
    inStock: true,
  },
  {
    name: "Layered Gold Necklace",
    description:
      "Trendy 3-layer gold necklace with delicate chain and star charms, bohemian chic",
    imageUrl: "/assets/generated/necklace1.dim_400x400.jpg",
    category: "Necklaces",
    price: 179900n,
    originalPrice: 299900n,
    rating: 4.6,
    reviewCount: 943n,
    inStock: true,
  },
  {
    name: "Rose Gold Ring Set",
    description:
      "Set of 3 stackable rose gold rings with cubic zirconia accents, modern and trendy",
    imageUrl: "/assets/generated/ring1.dim_400x400.jpg",
    category: "Rings",
    price: 129900n,
    originalPrice: 249900n,
    rating: 4.5,
    reviewCount: 2156n,
    inStock: true,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatPrice(paise: bigint): string {
  const rupees = Number(paise) / 100;
  return `₹${rupees.toLocaleString("en-IN")}`;
}

function getDiscount(price: bigint, originalPrice: bigint): number {
  if (originalPrice === 0n) return 0;
  return Math.round((1 - Number(price) / Number(originalPrice)) * 100);
}

// ─── ProductCard ────────────────────────────────────────────────────────────────
interface ProductCardProps {
  product: Product;
  productId: bigint;
  onAddToCart: (id: bigint, name: string) => void;
  compact?: boolean;
  index: number;
}

function ProductCard({
  product,
  productId,
  onAddToCart,
  compact = false,
  index,
}: ProductCardProps) {
  const discount = getDiscount(product.price, product.originalPrice);
  return (
    <motion.div
      data-ocid={`product.item.${index}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className={`bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col ${
        compact ? "min-w-[185px] max-w-[185px]" : ""
      }`}
    >
      <div className="relative bg-rose-50">
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-nn-red text-white text-xs font-bold px-1.5 py-0.5 rounded-md z-10">
            -{discount}%
          </span>
        )}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full aspect-square object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/generated/necklace1.dim_400x400.jpg";
          }}
        />
      </div>
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="bg-nn-green text-white text-xs font-semibold px-1.5 py-0.5 rounded-md">
            {product.rating.toFixed(1)}★
          </span>
          <span className="text-xs text-gray-400">
            ({Number(product.reviewCount).toLocaleString("en-IN")})
          </span>
        </div>
        <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-2 flex-1 leading-relaxed">
          {product.name}
        </p>
        <div className="flex flex-wrap items-baseline gap-1 mb-2">
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs text-gray-400 line-through">
            {formatPrice(product.originalPrice)}
          </span>
        </div>
        {discount > 0 && (
          <p className="text-xs text-nn-red font-semibold mb-2">
            {discount}% off
          </p>
        )}
        <button
          type="button"
          data-ocid={`product.primary_button.${index}`}
          onClick={() => onAddToCart(productId, product.name)}
          className="w-full bg-nn-cta text-white text-xs font-semibold py-2 rounded-lg hover:bg-nn-cta-hover transition-colors mt-auto"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}

// ─── CartSidebar ────────────────────────────────────────────────────────────────
interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
  productIds: Record<string, bigint>;
}

function CartSidebar({
  open,
  onClose,
  onCheckout,
  productIds,
}: CartSidebarProps) {
  const { data: cartItems = [], isLoading } = useGetCart();
  const removeFromCart = useRemoveFromCart();

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0n,
  );

  const handleRemove = (product: Product) => {
    const id = productIds[product.name];
    if (id === undefined) return;
    removeFromCart.mutate(id, {
      onSuccess: () => toast.success("Removed from cart"),
    });
  };

  const handleCheckout = () => {
    onClose();
    onCheckout();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        data-ocid="cart.sheet"
        side="right"
        className="w-[400px] sm:w-[440px] flex flex-col p-0 bg-white"
      >
        <SheetHeader className="bg-nn-header text-white px-4 py-3">
          <SheetTitle className="text-white text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart
            {cartItems.length > 0 && (
              <span className="ml-auto text-sm font-normal text-rose-200">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div
              data-ocid="cart.loading_state"
              className="flex items-center justify-center py-16"
            >
              <div className="animate-spin w-8 h-8 border-4 border-nn-cta border-t-transparent rounded-full" />
            </div>
          ) : cartItems.length === 0 ? (
            <div
              data-ocid="cart.empty_state"
              className="flex flex-col items-center justify-center py-16 px-6 text-center"
            >
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-gray-600 mb-1">
                Your cart is empty
              </p>
              <p className="text-sm text-gray-400">
                Add some beautiful jewelry to get started
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 bg-nn-cta text-white font-semibold text-sm px-6 py-2 rounded-xl hover:bg-nn-cta-hover transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {cartItems.map((item: CartItem, i: number) => (
                  <motion.div
                    key={item.product.name}
                    data-ocid={`cart.item.${i + 1}`}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-3 p-4"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl border border-rose-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-nn-green font-semibold mb-1">
                        {item.product.inStock ? "In Stock" : "Out of Stock"}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(item.product.price)}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">
                            × {Number(item.quantity)}
                          </span>
                        </div>
                        <button
                          type="button"
                          data-ocid={`cart.delete_button.${i + 1}`}
                          onClick={() => handleRemove(item.product)}
                          className="text-nn-red hover:opacity-70 transition-opacity p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-rose-50/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-600">
                Subtotal ({cartItems.length} item
                {cartItems.length !== 1 ? "s" : ""}):
              </span>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(total)}
              </span>
            </div>
            <button
              type="button"
              data-ocid="cart.primary_button"
              onClick={handleCheckout}
              className="w-full bg-nn-cta text-white font-bold text-sm py-3 rounded-xl hover:bg-nn-cta-hover transition-colors"
            >
              Proceed to Checkout →
            </button>
            <button
              type="button"
              data-ocid="cart.secondary_button"
              onClick={onClose}
              className="w-full mt-2 bg-white border border-gray-200 text-gray-700 font-medium text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────────
function SectionTitle({
  title,
  subtitle,
}: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-gray-900 border-b-2 border-nn-cta pb-2 inline-block">
        {title}
      </h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
type AppPage = "store" | "admin";

export default function App() {
  const [page, setPage] = useState<AppPage>("store");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [productIds, setProductIds] = useState<Record<string, bigint>>({});
  const seedingRef = useRef(false);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: products = [], isLoading: productsLoading } = useGetProducts();
  const { data: cartItems = [] } = useGetCart();
  const addToCartMutation = useAddToCart();
  const { data: searchResults = [] } = useSearchProducts(activeSearch);

  // Seed products if backend is empty
  useEffect(() => {
    if (!actor || productsLoading || seedingRef.current) return;
    if (products.length > 0) return;
    seedingRef.current = true;

    const seed = async () => {
      const newIds: Record<string, bigint> = {};
      for (const p of MOCK_PRODUCTS) {
        const id = await actor.addProduct(p);
        newIds[p.name] = id;
      }
      setProductIds(newIds);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    };

    seed().catch(console.error);
  }, [actor, productsLoading, products.length, queryClient]);

  // Build productIds map once products are loaded (if not seeded)
  useEffect(() => {
    if (products.length > 0 && Object.keys(productIds).length === 0) {
      const ids: Record<string, bigint> = {};
      products.forEach((p, i) => {
        ids[p.name] = BigInt(i);
      });
      setProductIds(ids);
    }
  }, [products, productIds]);

  const handleAddToCart = useCallback(
    (productId: bigint, name: string) => {
      addToCartMutation.mutate(
        { productId, quantity: 1n },
        {
          onSuccess: () => {
            toast.success(`${name} added to cart!`, {
              action: { label: "View Cart", onClick: () => setCartOpen(true) },
            });
          },
          onError: () => toast.error("Failed to add to cart"),
        },
      );
    },
    [addToCartMutation],
  );

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery.trim());
      setSelectedCategory("All");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
  };

  const handleLogoClick = () => {
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0;
      setPage("admin");
      return;
    }
    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, 3000);
  };

  const displayedProducts = activeSearch.trim()
    ? searchResults
    : selectedCategory === "All" ||
        selectedCategory === "Deals" ||
        selectedCategory === "New Arrivals" ||
        selectedCategory === "Gifting"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const dealProducts = [...products]
    .sort(
      (a, b) =>
        getDiscount(b.price, b.originalPrice) -
        getDiscount(a.price, a.originalPrice),
    )
    .slice(0, 8);

  const ringProducts = products.filter((p) => p.category === "Rings");

  const cartCount = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity),
    0,
  );

  // Show admin panel
  if (page === "admin") {
    return (
      <>
        <AdminPanel onBack={() => setPage("store")} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-nn-page-bg">
      {/* Announcement Strip */}
      <div className="bg-nn-strip text-white text-center py-1.5 px-4">
        <p className="text-xs font-medium tracking-wide">
          🎁 FREE delivery on orders above ₹999  |  Use code{" "}
          <span className="font-bold text-yellow-300">NEXAFIRST</span> for 10%
          off your first order
        </p>
      </div>

      {/* Primary Header */}
      <header className="bg-nn-header sticky top-0 z-50 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-3 py-2 flex items-center gap-3">
          {/* Logo */}
          <button
            type="button"
            data-ocid="header.link"
            onClick={handleLogoClick}
            className="flex items-center gap-1.5 border-2 border-transparent hover:border-white rounded-xl px-2 py-1 transition-colors flex-shrink-0"
          >
            <img
              src="/assets/generated/logo-transparent.png"
              alt="NexaNouri"
              className="h-12 w-auto object-contain"
            />
          </button>

          {/* Deliver to */}
          <div className="hidden md:flex flex-col text-white cursor-pointer border-2 border-transparent hover:border-white rounded-xl px-2 py-1 flex-shrink-0">
            <span className="text-xs text-rose-200">Deliver to</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm font-bold">India</span>
            </div>
          </div>

          {/* Search Bar */}
          <div
            data-ocid="header.search_input"
            className="flex-1 flex rounded-xl overflow-hidden border-2 border-yellow-300"
          >
            <select className="bg-rose-100 border-r border-rose-200 text-xs text-gray-700 px-2 py-2 hidden sm:block cursor-pointer">
              <option>All</option>
              <option>Necklaces</option>
              <option>Rings</option>
              <option>Earrings</option>
              <option>Bracelets</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search for necklaces, rings, earrings, and more…"
              className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="bg-white px-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              data-ocid="header.primary_button"
              onClick={handleSearch}
              className="bg-yellow-300 px-4 flex items-center hover:opacity-90 transition-opacity"
            >
              <Search className="w-5 h-5 text-gray-900" />
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              data-ocid="header.secondary_button"
              className="flex flex-col text-white border-2 border-transparent hover:border-white rounded-xl px-2 py-1 transition-colors cursor-pointer flex-shrink-0"
            >
              <span className="text-xs text-rose-200">Hello, Sign in</span>
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span className="text-sm font-bold">Account</span>
              </div>
            </button>

            <button
              type="button"
              data-ocid="header.open_modal_button"
              onClick={() => setCartOpen(true)}
              className="relative flex items-end gap-1 text-white border-2 border-transparent hover:border-white rounded-xl px-2 py-1 transition-colors"
            >
              <div className="relative">
                <ShoppingCart className="w-7 h-7" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-1 bg-yellow-300 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold pb-0.5">Cart</span>
            </button>
          </div>
        </div>

        {/* Secondary Nav */}
        <nav className="bg-nn-nav">
          <div className="max-w-[1400px] mx-auto px-3 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
            {NAV_CATEGORIES.map((cat, i) => (
              <button
                type="button"
                key={cat}
                data-ocid={i === 0 ? "nav.tab" : "nav.link"}
                onClick={() => {
                  clearSearch();
                  setSelectedCategory(cat);
                }}
                className={`text-white text-xs font-medium whitespace-nowrap px-2.5 py-2 border-2 transition-colors flex-shrink-0 rounded-sm ${
                  selectedCategory === cat
                    ? "border-white"
                    : "border-transparent hover:border-white"
                } ${i === 0 ? "flex items-center gap-1" : ""}`}
              >
                {i === 0 && <Menu className="w-3.5 h-3.5" />}
                {cat}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main>
        {/* Search Results Banner */}
        <AnimatePresence>
          {activeSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border-b border-gray-200 px-4 py-3"
            >
              <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Search results for{" "}
                  <strong>&ldquo;{activeSearch}&rdquo;</strong>
                  {" — "}
                  {searchResults.length} item
                  {searchResults.length !== 1 ? "s" : ""} found
                </p>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-nn-cta text-sm font-medium hover:underline"
                >
                  Clear search
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!activeSearch && selectedCategory === "All" && (
          <>
            {/* Hero Section */}
            <section className="max-w-[1400px] mx-auto px-4 pt-4 pb-2">
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/assets/generated/hero-banner.dim_1200x400.jpg"
                  alt="NexaNouri - Luxury Jewelry"
                  className="w-full h-[280px] sm:h-[360px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 sm:p-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <p className="text-yellow-300 text-sm font-semibold mb-1 tracking-widest uppercase">
                      New Collection 2026
                    </p>
                    <h1 className="text-white text-2xl sm:text-4xl font-bold mb-2 leading-tight">
                      Luxury Jewelry,
                      <br />
                      Delivered to Your Door
                    </h1>
                    <p className="text-gray-200 text-sm mb-4 hidden sm:block">
                      Authentic designs • Free delivery above ₹999
                    </p>
                    <button
                      type="button"
                      data-ocid="hero.primary_button"
                      onClick={() => setSelectedCategory("All")}
                      className="bg-nn-cta text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-nn-cta-hover transition-colors"
                    >
                      Shop Now →
                    </button>
                  </motion.div>
                </div>
                <div className="absolute bottom-4 right-4 flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i === 0 ? "bg-white" : "bg-white/40"}`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Value Props */}
            <section className="max-w-[1400px] mx-auto px-4 py-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    icon: <Gem className="w-5 h-5" />,
                    title: "Authentic Designs",
                    sub: "Certified genuine jewelry",
                  },
                  {
                    icon: <Truck className="w-5 h-5" />,
                    title: "Free Delivery",
                    sub: "On orders above ₹999",
                  },
                  {
                    icon: <RotateCcw className="w-5 h-5" />,
                    title: "Easy Returns",
                    sub: "7-day hassle-free",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-white rounded-xl border border-rose-100 p-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-nn-cta flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate hidden sm:block">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Shop by Category */}
            <section className="max-w-[1400px] mx-auto px-4 py-4">
              <SectionTitle title="Shop by Category" />
              <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-2">
                {CATEGORY_DATA.map((cat) => (
                  <button
                    type="button"
                    key={cat.name}
                    data-ocid="category.tab"
                    onClick={() => setSelectedCategory(cat.name)}
                    className="flex flex-col items-center flex-shrink-0 group cursor-pointer"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-rose-100 group-hover:border-nn-cta transition-colors">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 mt-2 text-center w-20">
                      {cat.name}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Deals Section */}
            <section className="max-w-[1400px] mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 border-b-2 border-nn-red pb-2 inline-block">
                  TODAY&apos;S TOP DEALS &amp; OFFERS
                </h2>
                <button
                  type="button"
                  data-ocid="deals.link"
                  onClick={() => setSelectedCategory("Deals")}
                  className="text-nn-cta text-sm font-semibold hover:underline"
                >
                  See all deals →
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {productsLoading
                  ? ["s1", "s2", "s3", "s4", "s5", "s6"].map((sk) => (
                      <div
                        key={sk}
                        data-ocid="deals.loading_state"
                        className="min-w-[185px] h-64 bg-white rounded-xl border border-gray-200 animate-pulse"
                      />
                    ))
                  : dealProducts.map((product, i) => (
                      <ProductCard
                        key={product.name}
                        product={product}
                        productId={productIds[product.name] ?? BigInt(i)}
                        onAddToCart={handleAddToCart}
                        compact
                        index={i + 1}
                      />
                    ))}
              </div>
            </section>
          </>
        )}

        {/* Trending / All Products Section */}
        <section className="max-w-[1400px] mx-auto px-4 py-4">
          <SectionTitle
            title={
              activeSearch
                ? `Results for “${activeSearch}”`
                : selectedCategory === "All"
                  ? "Trending Jewelry"
                  : `${selectedCategory}`
            }
            subtitle={
              displayedProducts.length > 0
                ? `${displayedProducts.length} products`
                : undefined
            }
          />
          {productsLoading ? (
            <div
              data-ocid="products.loading_state"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
            >
              {[
                "p1",
                "p2",
                "p3",
                "p4",
                "p5",
                "p6",
                "p7",
                "p8",
                "p9",
                "p10",
              ].map((sk) => (
                <div
                  key={sk}
                  className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : displayedProducts.length === 0 ? (
            <div
              data-ocid="products.empty_state"
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-gray-600">
                No products found
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Try a different search or category
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {displayedProducts.map((product, i) => (
                <ProductCard
                  key={`${product.name}-${i}`}
                  product={product}
                  productId={productIds[product.name] ?? BigInt(i)}
                  onAddToCart={handleAddToCart}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </section>

        {/* Featured Rings */}
        {!activeSearch && ringProducts.length > 0 && (
          <section className="max-w-[1400px] mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 border-b-2 border-nn-cta pb-2 inline-block">
                Featured Rings
              </h2>
              <button
                type="button"
                data-ocid="rings.link"
                onClick={() => setSelectedCategory("Rings")}
                className="text-nn-cta text-sm font-semibold hover:underline"
              >
                See all rings →
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {ringProducts.map((product, i) => (
                <ProductCard
                  key={`ring-${product.name}`}
                  product={product}
                  productId={productIds[product.name] ?? BigInt(i)}
                  onAddToCart={handleAddToCart}
                  compact
                  index={i + 1}
                />
              ))}
            </div>
          </section>
        )}

        {/* Promotional Banner */}
        {!activeSearch && selectedCategory === "All" && (
          <section className="max-w-[1400px] mx-auto px-4 py-4">
            <div className="bg-nn-cta rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white text-center sm:text-left">
                <p className="text-lg font-bold mb-1">Gifting Made Easy 🎁</p>
                <p className="text-sm text-rose-200">
                  Shop our curated gifting collection — perfect for every
                  occasion
                </p>
              </div>
              <button
                type="button"
                data-ocid="promo.primary_button"
                onClick={() => setSelectedCategory("Gifting")}
                className="bg-white text-nn-cta font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-rose-50 transition-colors flex-shrink-0"
              >
                Shop Gifting →
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-nn-footer text-white mt-8">
        <div className="bg-nn-cta hover:bg-nn-cta-hover transition-colors">
          <button
            type="button"
            data-ocid="footer.link"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-full text-center py-3 text-sm font-medium text-white"
          >
            ↑ Back to top
          </button>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-sm mb-3 text-white">
                Get to Know Us
              </h3>
              <ul className="space-y-2">
                {[
                  "About NexaNouri",
                  "Careers",
                  "Press Releases",
                  "NexaNouri Cares",
                  "Our Blog",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="/"
                      className="text-rose-200 text-xs hover:text-white hover:underline"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-3 text-white">
                Connect With Us
              </h3>
              <ul className="space-y-2">
                {[
                  "Facebook",
                  "Instagram",
                  "Twitter / X",
                  "YouTube",
                  "Pinterest",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="/"
                      className="text-rose-200 text-xs hover:text-white hover:underline"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-3 text-white">
                Make Money With Us
              </h3>
              <ul className="space-y-2">
                {[
                  "Sell on NexaNouri",
                  "Become an Affiliate",
                  "Advertise With Us",
                  "Wholesale & Bulk",
                  "Partner Program",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="/"
                      className="text-rose-200 text-xs hover:text-white hover:underline"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-3 text-white">
                Let Us Help You
              </h3>
              <ul className="space-y-2">
                {[
                  "Your Account",
                  "Track Your Orders",
                  "Returns & Exchanges",
                  "Shipping Info",
                  "Help Center",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="/"
                      className="text-rose-200 text-xs hover:text-white hover:underline"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-6">
          <div className="max-w-[1400px] mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-3">
              <img
                src="/assets/generated/logo-transparent.png"
                alt="NexaNouri"
                className="h-14 w-auto object-contain mx-auto"
              />
            </div>
            <p className="text-xs text-rose-200 mb-2">
              © {new Date().getFullYear()} NexaNouri. Premium Jewelry for Every
              Occasion.
            </p>
            <p className="text-xs text-rose-300">
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => setCheckoutOpen(true)}
        productIds={productIds}
      />

      {/* Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal
          cartItems={cartItems}
          total={cartItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0n,
          )}
          onClose={() => setCheckoutOpen(false)}
        />
      )}

      {/* AI Chat Widget */}
      <ChatWidget />

      <Toaster />
    </div>
  );
}
