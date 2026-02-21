"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from "react";
import type { CartItem, Sku, Product } from "@/types";

// ─── State ───────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; payload: CartItem }
  | { type: "REMOVE"; skuId: string }
  | { type: "UPDATE_QTY"; skuId: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "INIT"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "INIT":
      return { items: action.items };

    case "ADD": {
      const existing = state.items.find(
        (i) => i.sku.id === action.payload.sku.id
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.sku.id === action.payload.sku.id
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, action.payload] };
    }

    case "REMOVE":
      return { items: state.items.filter((i) => i.sku.id !== action.skuId) };

    case "UPDATE_QTY":
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.sku.id !== action.skuId) };
      }
      return {
        items: state.items.map((i) =>
          i.sku.id === action.skuId ? { ...i, quantity: action.quantity } : i
        ),
      };

    case "CLEAR":
      return { items: [] };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (
    sku: Sku & { product: Pick<Product, "id" | "name" | "slug" | "image_url"> },
    quantity?: number
  ) => void;
  removeItem: (skuId: string) => void;
  updateQuantity: (skuId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "podi_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load persisted cart on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        dispatch({ type: "INIT", items: parsed });
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  // Persist cart on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const count = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, i) => sum + i.sku.price * i.quantity,
    0
  );

  function addItem(
    sku: Sku & { product: Pick<Product, "id" | "name" | "slug" | "image_url"> },
    quantity = 1
  ) {
    dispatch({ type: "ADD", payload: { sku, quantity } });
  }

  function removeItem(skuId: string) {
    dispatch({ type: "REMOVE", skuId });
  }

  function updateQuantity(skuId: string, quantity: number) {
    dispatch({ type: "UPDATE_QTY", skuId, quantity });
  }

  function clearCart() {
    dispatch({ type: "CLEAR" });
  }

  return (
    <CartContext.Provider
      value={{ items: state.items, count, subtotal, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
