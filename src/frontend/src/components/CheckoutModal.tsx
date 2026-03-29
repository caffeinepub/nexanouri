import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Copy, CreditCard, Truck, X } from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";
import { PaymentMethod } from "../backend";
import type { CartItem } from "../backend";
import { useGetPaymentSettings, usePlaceOrder } from "../hooks/useQueries";

interface CheckoutModalProps {
  cartItems: CartItem[];
  total: bigint;
  onClose: () => void;
}

function formatPrice(paise: bigint): string {
  const rupees = Number(paise) / 100;
  return `₹${rupees.toLocaleString("en-IN")}`;
}

type Step = "form" | "qr" | "success";

export default function CheckoutModal({
  cartItems,
  total,
  onClose,
}: CheckoutModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "prepaid">("cod");
  const [orderId, setOrderId] = useState<bigint>(0n);
  const [upiLink, setUpiLink] = useState("");

  const placeOrder = usePlaceOrder();
  const { data: paymentSettings } = useGetPaymentSettings();

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!/^[0-9]{10}$/.test(phone.trim())) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    const orderedItems = cartItems.map((item) => ({
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const method =
      paymentMethod === "cod"
        ? PaymentMethod.cashOnDelivery
        : PaymentMethod.prepaid;

    try {
      const newOrderId = await placeOrder.mutateAsync({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        orderedItems,
        totalAmount: total,
        paymentMethod: method,
      });
      setOrderId(newOrderId);

      if (paymentMethod === "prepaid") {
        const upiId = paymentSettings?.upiId ?? "nexanouri@upi";
        const accountName = paymentSettings?.accountHolderName ?? "NexaNouri";
        const amountRupees = Number(total) / 100;
        const link = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(accountName)}&am=${amountRupees.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`NexaNouri Order ${newOrderId}`)}`;
        setUpiLink(link);
        setStep("qr");
      } else {
        setStep("success");
      }
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <div
      data-ocid="checkout.modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="presentation"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-nn-header text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {step === "form" && "Checkout"}
            {step === "qr" && "Complete Payment"}
            {step === "success" && "Order Confirmed!"}
          </h2>
          <button
            type="button"
            data-ocid="checkout.close_button"
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Step */}
        {step === "form" && (
          <div className="p-6 space-y-4">
            {/* Order Summary */}
            <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Order Summary ({cartItems.length} item
                {cartItems.length !== 1 ? "s" : ""})
              </p>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.product.name}
                    className="flex justify-between text-xs text-gray-600"
                  >
                    <span className="truncate max-w-[200px]">
                      {item.product.name} × {Number(item.quantity)}
                    </span>
                    <span className="font-medium ml-2">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-rose-200 mt-2 pt-2 flex justify-between">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-sm font-bold text-nn-cta">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="space-y-3">
              <div>
                <Label
                  htmlFor="checkout-name"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name *
                </Label>
                <Input
                  id="checkout-name"
                  data-ocid="checkout.input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="checkout-phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number *
                </Label>
                <Input
                  id="checkout-phone"
                  data-ocid="checkout.input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="checkout-address"
                  className="text-sm font-medium text-gray-700"
                >
                  Delivery Address *
                </Label>
                <Textarea
                  id="checkout-address"
                  data-ocid="checkout.textarea"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No., Street, City, State, PIN Code"
                  rows={3}
                  className="mt-1 resize-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Payment Method *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  data-ocid="checkout.toggle"
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === "cod"
                      ? "border-nn-cta bg-rose-50 text-nn-cta"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Truck className="w-6 h-6" />
                  <span className="text-xs font-semibold text-center leading-tight">
                    Cash on Delivery
                  </span>
                </button>
                <button
                  type="button"
                  data-ocid="checkout.toggle"
                  onClick={() => setPaymentMethod("prepaid")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === "prepaid"
                      ? "border-nn-cta bg-rose-50 text-nn-cta"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs font-semibold text-center leading-tight">
                    Pay Now (UPI/QR)
                  </span>
                </button>
              </div>
            </div>

            <Button
              data-ocid="checkout.submit_button"
              onClick={handleSubmit}
              disabled={placeOrder.isPending}
              className="w-full bg-nn-cta hover:bg-nn-cta-hover text-white font-bold py-3 rounded-xl"
            >
              {placeOrder.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Placing Order...
                </span>
              ) : (
                `Place Order — ${formatPrice(total)}`
              )}
            </Button>
          </div>
        )}

        {/* QR Payment Step */}
        {step === "qr" && (
          <div className="p-6 text-center space-y-5">
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                Scan to Pay {formatPrice(total)}
              </p>
              <p className="text-sm text-gray-500">
                Order #{String(orderId)} • Use any UPI app
              </p>
            </div>

            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-2xl border-2 border-rose-200 shadow-lg inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}&color=be123c`}
                  alt="UPI QR Code"
                  width={220}
                  height={220}
                  className="rounded-lg"
                />
              </div>
            </div>

            {paymentSettings?.upiId && (
              <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                <p className="text-xs text-gray-500 mb-1">UPI ID</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm font-bold text-gray-900">
                    {paymentSettings.upiId}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(paymentSettings.upiId);
                      toast.success("UPI ID copied!");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <p>1. Open any UPI app (PhonePe, Google Pay, Paytm)</p>
              <p>2. Scan the QR code above</p>
              <p>3. Verify amount and pay</p>
            </div>

            <Button
              data-ocid="checkout.confirm_button"
              onClick={() => setStep("success")}
              className="w-full bg-nn-green text-white font-bold py-3 rounded-xl hover:opacity-90"
            >
              I Have Paid ✓
            </Button>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Go back
            </button>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div
            data-ocid="checkout.success_state"
            className="p-6 text-center space-y-5"
          >
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Order Placed! 🎉
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Thank you, <strong>{name}</strong>!
              </p>
              <p className="text-sm text-gray-500">
                Your order #{String(orderId)} has been confirmed.
              </p>
            </div>
            <div className="bg-rose-50 rounded-xl p-4 border border-rose-100 text-left space-y-1">
              <p className="text-xs text-gray-500 font-medium">
                Delivery details
              </p>
              <p className="text-sm text-gray-900">{address}</p>
              <p className="text-sm text-gray-600">📞 {phone}</p>
            </div>
            <p className="text-xs text-gray-500">
              {paymentMethod === "cod"
                ? "Pay when your order arrives. Estimated delivery: 3-5 business days."
                : "Payment received. Your order will be shipped soon!"}
            </p>
            <Button
              data-ocid="checkout.close_button"
              onClick={onClose}
              className="w-full bg-nn-cta hover:bg-nn-cta-hover text-white font-bold py-3 rounded-xl"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
