import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  CreditCard,
  KeyRound,
  Loader2,
  LogOut,
  Package,
  PackageCheck,
  Plus,
  Settings,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order, PaymentSettings, Product } from "../backend";
import { OrderStatus } from "../backend";
import {
  useAddProduct,
  useChangeAdminPasscode,
  useGetAllOrders,
  useGetPaymentSettings,
  useGetProducts,
  useUpdateOrderStatus,
  useUpdatePaymentSettings,
  useVerifyAdminPasscode,
} from "../hooks/useQueries";

type AdminTab = "dashboard" | "products" | "orders" | "payment";

function formatPrice(paise: bigint): string {
  const rupees = Number(paise) / 100;
  return `₹${rupees.toLocaleString("en-IN")}`.replace(".00", "");
}

function statusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.pending:
      return "bg-yellow-100 text-yellow-700";
    case OrderStatus.processing:
      return "bg-blue-100 text-blue-700";
    case OrderStatus.shipped:
      return "bg-purple-100 text-purple-700";
    case OrderStatus.delivered:
      return "bg-green-100 text-green-700";
    case OrderStatus.cancelled:
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({
  orders,
  products,
}: { orders: Order[]; products: Product[] }) {
  const totalRevenue = orders
    .filter((o) => o.status !== OrderStatus.cancelled)
    .reduce((sum, o) => sum + o.totalAmount, 0n);
  const pendingOrders = orders.filter(
    (o) => o.status === OrderStatus.pending,
  ).length;

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: <Package className="w-6 h-6" />,
      color: "bg-rose-50 text-nn-cta",
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: <ShoppingBag className="w-6 h-6" />,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: <PackageCheck className="w-6 h-6" />,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      icon: <BarChart3 className="w-6 h-6" />,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Dashboard Overview
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={s.label}
            data-ocid={`admin.dashboard.card.${i + 1}`}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${s.color}`}
            >
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Recent Orders
        </h3>
        {orders.length === 0 ? (
          <p
            data-ocid="admin.orders.empty_state"
            className="text-sm text-gray-400 text-center py-8"
          >
            No orders yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order, i) => (
                  <TableRow
                    key={String(order.orderId)}
                    data-ocid={`admin.orders.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs">
                      #{String(order.orderId)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.customerName}
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      {formatPrice(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────
function ProductsTab() {
  const { data: products = [] } = useGetProducts();
  const addProduct = useAddProduct();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Necklaces",
    price: "",
    originalPrice: "",
    imageUrl: "",
    rating: "4.5",
    reviewCount: "0",
    inStock: true,
  });

  const handleAdd = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    const product: Product = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      price: BigInt(Math.round(Number.parseFloat(form.price) * 100)),
      originalPrice: BigInt(
        Math.round(Number.parseFloat(form.originalPrice || form.price) * 100),
      ),
      imageUrl:
        form.imageUrl.trim() || "/assets/generated/necklace1.dim_400x400.jpg",
      rating: Number.parseFloat(form.rating),
      reviewCount: BigInt(Number.parseInt(form.reviewCount)),
      inStock: form.inStock,
    };
    await addProduct.mutateAsync(product);
    toast.success("Product added successfully!");
    setShowForm(false);
    setForm({
      name: "",
      description: "",
      category: "Necklaces",
      price: "",
      originalPrice: "",
      imageUrl: "",
      rating: "4.5",
      reviewCount: "0",
      inStock: true,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Products</h2>
        <Button
          data-ocid="admin.products.primary_button"
          onClick={() => setShowForm(!showForm)}
          className="bg-nn-cta hover:bg-nn-cta-hover text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            New Product
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-gray-600">
                Product Name *
              </Label>
              <Input
                data-ocid="admin.products.input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Gold Kundan Necklace"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">
                Category
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger
                  data-ocid="admin.products.select"
                  className="mt-1"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Necklaces",
                    "Rings",
                    "Earrings",
                    "Bracelets",
                    "Men's",
                    "Gifting",
                  ].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">
                Price (₹) *
              </Label>
              <Input
                data-ocid="admin.products.input"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 999"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">
                Original Price (₹)
              </Label>
              <Input
                data-ocid="admin.products.input"
                type="number"
                value={form.originalPrice}
                onChange={(e) =>
                  setForm({ ...form, originalPrice: e.target.value })
                }
                placeholder="e.g. 1499"
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-medium text-gray-600">
                Description
              </Label>
              <Textarea
                data-ocid="admin.products.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Product description..."
                rows={2}
                className="mt-1 resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-medium text-gray-600">
                Image URL
              </Label>
              <Input
                data-ocid="admin.products.input"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="/assets/generated/... or https://..."
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              data-ocid="admin.products.submit_button"
              onClick={handleAdd}
              disabled={addProduct.isPending}
              className="bg-nn-cta hover:bg-nn-cta-hover text-white"
            >
              {addProduct.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Product"
              )}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <p
                      data-ocid="admin.products.empty_state"
                      className="text-center text-gray-400 text-sm py-8"
                    >
                      No products found
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p, i) => (
                  <TableRow
                    key={`${p.name}-${i}`}
                    data-ocid={`admin.products.row.${i + 1}`}
                  >
                    <TableCell>
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    </TableCell>
                    <TableCell className="text-sm font-medium max-w-[180px] truncate">
                      {p.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      {formatPrice(p.price)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          p.inStock
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: bigint, newStatus: string) => {
    await updateStatus.mutateAsync({
      orderId,
      newStatus: newStatus as OrderStatus,
    });
    toast.success("Order status updated");
  };

  if (isLoading) {
    return (
      <div
        data-ocid="admin.orders.loading_state"
        className="flex justify-center py-16"
      >
        <Loader2 className="w-8 h-8 animate-spin text-nn-cta" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Orders ({orders.length})
      </h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <p
                      data-ocid="admin.orders.empty_state"
                      className="text-center text-gray-400 text-sm py-8"
                    >
                      No orders yet
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order, i) => (
                  <TableRow
                    key={String(order.orderId)}
                    data-ocid={`admin.orders.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs font-bold">
                      #{String(order.orderId)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.customerName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {order.customerPhone}
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      {formatPrice(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          order.paymentMethod === "prepaid"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {order.paymentMethod === "prepaid" ? "Prepaid" : "COD"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={order.status}
                        onValueChange={(v) =>
                          handleStatusChange(order.orderId, v)
                        }
                      >
                        <SelectTrigger
                          data-ocid={`admin.orders.select.${i + 1}`}
                          className="w-32 h-8 text-xs"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(OrderStatus).map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// ─── Change Passcode Section ──────────────────────────────────────────────────
function ChangePasscodeSection() {
  const changePasscode = useChangeAdminPasscode();
  const [open, setOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");

  const handleChange = async () => {
    if (newCode.length !== 6) {
      toast.error("New passcode must be 6 digits");
      return;
    }
    if (newCode !== confirmCode) {
      toast.error("New passcode and confirmation do not match");
      return;
    }
    const success = await changePasscode.mutateAsync({ currentCode, newCode });
    if (success) {
      toast.success("Passcode changed successfully!");
      setCurrentCode("");
      setNewCode("");
      setConfirmCode("");
      setOpen(false);
    } else {
      toast.error("Current passcode is incorrect");
    }
  };

  return (
    <div className="mt-6 border border-rose-100 rounded-2xl overflow-hidden">
      <button
        type="button"
        data-ocid="admin.passcode.toggle"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-rose-50 hover:bg-rose-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-nn-cta font-semibold text-sm">
          <KeyRound className="w-4 h-4" />
          Change Admin Passcode
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-nn-cta" />
        ) : (
          <ChevronDown className="w-4 h-4 text-nn-cta" />
        )}
      </button>

      {open && (
        <div className="p-5 bg-white space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Current Passcode
            </Label>
            <div className="mt-2">
              <InputOTP
                maxLength={6}
                value={currentCode}
                onChange={setCurrentCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">
              New Passcode
            </Label>
            <div className="mt-2">
              <InputOTP maxLength={6} value={newCode} onChange={setNewCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Confirm New Passcode
            </Label>
            <div className="mt-2">
              <InputOTP
                maxLength={6}
                value={confirmCode}
                onChange={setConfirmCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <Button
            data-ocid="admin.passcode.submit_button"
            onClick={handleChange}
            disabled={changePasscode.isPending || currentCode.length < 6}
            className="bg-nn-cta hover:bg-nn-cta-hover text-white"
          >
            {changePasscode.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Changing...
              </span>
            ) : (
              "Change Passcode"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Payment Settings Tab ─────────────────────────────────────────────────────
function PaymentSettingsTab() {
  const { data: existing } = useGetPaymentSettings();
  const updateSettings = useUpdatePaymentSettings();
  const [form, setForm] = useState<PaymentSettings>({
    upiId: "",
    accountHolderName: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
  });
  const [loaded, setLoaded] = useState(false);

  if (existing && !loaded) {
    setForm(existing);
    setLoaded(true);
  }

  const handleSave = async () => {
    if (!form.upiId.trim() || !form.accountHolderName.trim()) {
      toast.error("UPI ID and Account Holder Name are required");
      return;
    }
    await updateSettings.mutateAsync(form);
    toast.success("Payment settings saved successfully!");
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Settings</h2>
      <p className="text-sm text-gray-500 mb-6">
        Configure UPI and bank account details. QR codes for prepaid orders will
        use your UPI ID.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs max-w-lg">
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="upi-id"
              className="text-sm font-medium text-gray-700"
            >
              UPI ID *
            </Label>
            <Input
              id="upi-id"
              data-ocid="admin.payment.input"
              value={form.upiId}
              onChange={(e) => setForm({ ...form, upiId: e.target.value })}
              placeholder="yourname@upi or yourphone@paytm"
              className="mt-1"
            />
            <p className="text-xs text-gray-400 mt-1">
              e.g. nexanouri@okaxis, 9876543210@paytm
            </p>
          </div>
          <div>
            <Label
              htmlFor="acc-holder"
              className="text-sm font-medium text-gray-700"
            >
              Account Holder Name *
            </Label>
            <Input
              id="acc-holder"
              data-ocid="admin.payment.input"
              value={form.accountHolderName}
              onChange={(e) =>
                setForm({ ...form, accountHolderName: e.target.value })
              }
              placeholder="Name as per bank account"
              className="mt-1"
            />
          </div>
          <div>
            <Label
              htmlFor="acc-number"
              className="text-sm font-medium text-gray-700"
            >
              Bank Account Number
            </Label>
            <Input
              id="acc-number"
              data-ocid="admin.payment.input"
              value={form.bankAccountNumber}
              onChange={(e) =>
                setForm({ ...form, bankAccountNumber: e.target.value })
              }
              placeholder="e.g. 1234567890"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ifsc" className="text-sm font-medium text-gray-700">
              IFSC Code
            </Label>
            <Input
              id="ifsc"
              data-ocid="admin.payment.input"
              value={form.ifscCode}
              onChange={(e) =>
                setForm({ ...form, ifscCode: e.target.value.toUpperCase() })
              }
              placeholder="e.g. SBIN0001234"
              maxLength={11}
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <Label
              htmlFor="bank-name"
              className="text-sm font-medium text-gray-700"
            >
              Bank Name
            </Label>
            <Input
              id="bank-name"
              data-ocid="admin.payment.input"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              placeholder="e.g. State Bank of India"
              className="mt-1"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-rose-50 rounded-xl border border-rose-100">
          <p className="text-xs font-semibold text-nn-cta mb-1">
            🔒 Secure & Instant Settlement
          </p>
          <p className="text-xs text-gray-600">
            All prepaid order payments via QR code are credited directly to your
            UPI ID / bank account instantly.
          </p>
        </div>

        <Button
          data-ocid="admin.payment.submit_button"
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="w-full mt-6 bg-nn-cta hover:bg-nn-cta-hover text-white font-bold py-3 rounded-xl"
        >
          {updateSettings.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </span>
          ) : (
            "Save Payment Settings"
          )}
        </Button>

        <ChangePasscodeSection />
      </div>
    </div>
  );
}

// ─── OTP Login Screen ─────────────────────────────────────────────────────────
interface OTPLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

function OTPLoginScreen({ onBack, onSuccess }: OTPLoginProps) {
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const verifyPasscode = useVerifyAdminPasscode();

  const handleVerify = async () => {
    if (otpValue.length < 6) {
      setOtpError("Please enter the full 6-digit passcode");
      return;
    }
    setOtpError("");
    const isValid = await verifyPasscode.mutateAsync(otpValue);
    if (isValid) {
      onSuccess();
    } else {
      setOtpError("Incorrect passcode. Try again.");
      setOtpValue("");
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-nn-cta" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
        <p className="text-sm text-gray-500 mb-8">
          Enter your admin passcode to continue
        </p>

        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpValue}
            onChange={(val) => {
              setOtpValue(val);
              if (otpError) setOtpError("");
            }}
            onComplete={handleVerify}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {otpError && (
          <p
            data-ocid="admin.login.error_state"
            className="text-sm text-red-500 mb-4 font-medium"
          >
            {otpError}
          </p>
        )}

        <Button
          data-ocid="admin.login.primary_button"
          onClick={handleVerify}
          disabled={verifyPasscode.isPending || otpValue.length < 6}
          className="w-full bg-nn-cta hover:bg-nn-cta-hover text-white font-bold py-3 rounded-xl"
        >
          {verifyPasscode.isPending ? (
            <span className="flex items-center gap-2 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
            </span>
          ) : (
            "Verify"
          )}
        </Button>

        <button
          type="button"
          data-ocid="admin.login.cancel_button"
          onClick={onBack}
          className="mt-4 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Store
        </button>
      </div>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const { data: orders = [] } = useGetAllOrders();
  const { data: products = [] } = useGetProducts();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  if (!isAdminAuthenticated) {
    return (
      <OTPLoginScreen
        onBack={onBack}
        onSuccess={() => setIsAdminAuthenticated(true)}
      />
    );
  }

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "products",
      label: "Products",
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      id: "payment",
      label: "Payment Settings",
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-nn-header text-white flex-shrink-0 flex-col hidden md:flex">
        <div className="p-5 border-b border-white/10">
          <p className="text-lg font-bold">NexaNouri</p>
          <p className="text-xs text-rose-200">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-ocid="admin.sidebar.tab"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white/20 text-white"
                  : "text-rose-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            type="button"
            data-ocid="admin.logout.button"
            onClick={() => setIsAdminAuthenticated(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-rose-200 hover:text-white text-sm transition-colors rounded-xl hover:bg-white/10"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
          <button
            type="button"
            data-ocid="admin.back.link"
            onClick={onBack}
            className="w-full flex items-center gap-2 px-3 py-2 text-rose-200 hover:text-white text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Store
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-nn-header text-white px-4 py-3 flex items-center justify-between">
        <p className="font-bold">Admin Panel</p>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                activeTab === tab.id ? "bg-white/20" : "hover:bg-white/10"
              }`}
              title={tab.label}
            >
              {tab.icon}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsAdminAuthenticated(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 hover:bg-white/10 rounded-lg"
            title="Back to Store"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto md:mt-0 mt-14">
        {activeTab === "dashboard" && (
          <Dashboard orders={orders} products={products} />
        )}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "payment" && <PaymentSettingsTab />}
      </main>
    </div>
  );
}
