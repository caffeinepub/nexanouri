import { Bot, MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const BOT_NAME = "Nouri";

function getBotReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("shipping") || lower.includes("deliver")) {
    return "We offer free shipping on orders above ₹999. Standard delivery takes 3-5 business days across India. 🚚";
  }
  if (
    lower.includes("return") ||
    lower.includes("refund") ||
    lower.includes("exchange")
  ) {
    return "We have a 7-day return policy. Items must be unused and in original packaging. Initiate returns via our Help Center. 📦";
  }
  if (
    lower.includes("payment") ||
    lower.includes("pay") ||
    lower.includes("upi") ||
    lower.includes("qr")
  ) {
    return "We accept UPI and Cash on Delivery. For prepaid orders, a QR code is auto-generated at checkout for instant payment. 💳";
  }
  if (lower.includes("track") || lower.includes("order status")) {
    return "To track your order, check your order confirmation email or contact us on WhatsApp at +91-9876543210. 📍";
  }
  if (
    lower.includes("contact") ||
    lower.includes("whatsapp") ||
    lower.includes("support")
  ) {
    return "Reach us on WhatsApp: +91-9876543210 or email hello@nexanouri.com. We reply within 2-4 hours! 💌";
  }
  if (
    lower.includes("jewel") ||
    lower.includes("gold") ||
    lower.includes("silver") ||
    lower.includes("diamond")
  ) {
    return "All our jewelry is quality tested, hallmarked, and comes with an authenticity guarantee. Perfect for every occasion! 💎";
  }
  if (
    lower.includes("offer") ||
    lower.includes("discount") ||
    lower.includes("deal") ||
    lower.includes("coupon")
  ) {
    return "Check our Today's Deals section for the best offers! Subscribe to our newsletter for exclusive discounts. 🎉";
  }
  if (lower.includes("size") || lower.includes("fit")) {
    return "Our rings and bracelets come with a size guide on each product page. Most chains and necklaces are adjustable. 📏";
  }
  if (
    lower.includes("hello") ||
    lower.includes("hi") ||
    lower.includes("hey")
  ) {
    return `Hello! I'm ${BOT_NAME}, your NexaNouri jewelry assistant 💕 How can I help you today?`;
  }
  return `Hi! I'm ${BOT_NAME}, your jewelry assistant. Ask me about shipping, returns, payments, order tracking, or any jewelry query! 💎`;
}

let msgCounter = 1;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: `Hi! I'm ${BOT_NAME}, your NexaNouri jewelry assistant 💕 How can I help you today?`,
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: msgCounter++, text, sender: "user" };
    const botMsg: Message = {
      id: msgCounter++,
      text: getBotReply(text),
      sender: "bot",
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            data-ocid="chat.open_modal_button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-nn-cta text-white shadow-xl flex items-center justify-center hover:bg-nn-cta-hover transition-colors"
            aria-label="Open chat"
          >
            <MessageCircle className="w-7 h-7" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            data-ocid="chat.panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-80 h-[420px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-rose-100"
          >
            {/* Header */}
            <div className="bg-nn-header text-white px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{BOT_NAME}</p>
                <p className="text-xs text-rose-200">
                  NexaNouri Assistant • Online
                </p>
              </div>
              <button
                type="button"
                data-ocid="chat.close_button"
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-rose-50/40">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-nn-cta text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-rose-100 rounded-bl-sm shadow-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-rose-100 flex gap-2">
              <input
                type="text"
                data-ocid="chat.input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 text-sm px-3 py-2 border border-rose-200 rounded-full outline-none focus:border-nn-cta transition-colors bg-rose-50/50"
              />
              <button
                type="button"
                data-ocid="chat.primary_button"
                onClick={sendMessage}
                className="w-9 h-9 rounded-full bg-nn-cta text-white flex items-center justify-center hover:bg-nn-cta-hover transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
