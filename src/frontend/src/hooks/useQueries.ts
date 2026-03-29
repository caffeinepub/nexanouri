import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CartItem,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentSettings,
  Product,
} from "../backend";
import { useActor } from "./useActor";

export function useGetProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useGetCart() {
  const { actor, isFetching } = useActor();
  return useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchProducts(keyword: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["search", keyword],
    queryFn: async () => {
      if (!actor || !keyword.trim()) return [];
      return actor.searchProducts(keyword);
    },
    enabled: !!actor && !isFetching && !!keyword.trim(),
    staleTime: 10000,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.removeFromCart(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      orderedItems: Array<{
        productName: string;
        quantity: bigint;
        price: bigint;
      }>;
      totalAmount: bigint;
      paymentMethod: PaymentMethod;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.placeOrder(
        params.customerName,
        params.customerPhone,
        params.customerAddress,
        params.orderedItems,
        params.totalAmount,
        params.paymentMethod,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
    }: { orderId: bigint; newStatus: OrderStatus }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateOrderStatus(orderId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useGetPaymentSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentSettings | null>({
    queryKey: ["paymentSettings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPaymentSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdatePaymentSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: PaymentSettings) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updatePaymentSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentSettings"] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useVerifyAdminPasscode() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (code: string): Promise<boolean> => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).verifyAdminPasscode(code);
    },
  });
}

export function useChangeAdminPasscode() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      currentCode,
      newCode,
    }: { currentCode: string; newCode: string }): Promise<boolean> => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).changeAdminPasscode(currentCode, newCode);
    },
  });
}
