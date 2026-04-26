import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_MENU, type MenuItem } from "./menu";

export type CartLine = { item: MenuItem; quantity: number };

export type Order = {
  id: string;
  items: CartLine[];
  totalAmount: number;
  profit: number;
  paymentMethod: "cash" | "upi";
  cashReceived?: number;
  change?: number;
  createdAt: number;
};

type Ctx = {
  cart: CartLine[];
  orders: Order[];
  menu: MenuItem[];
  total: number;
  profit: number;
  itemCount: number;
  addItem: (item: MenuItem) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  placeOrder: (o: Omit<Order, "id" | "createdAt" | "items" | "totalAmount" | "profit">) => Order;
  addMenuItem: (data: Omit<MenuItem, "id">) => MenuItem;
  updateMenuItem: (id: string, data: Omit<MenuItem, "id">) => void;
  deleteMenuItem: (id: string) => void;
};

const PosCtx = createContext<Ctx | null>(null);

export function PosProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>(DEFAULT_MENU);

  const addItem = useCallback((item: MenuItem) => {
    setCart((c) => {
      const existing = c.find((l) => l.item.id === item.id);
      if (existing) return c.map((l) => (l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l));
      return [...c, { item, quantity: 1 }];
    });
  }, []);

  const increment = useCallback((id: string) => {
    setCart((c) => c.map((l) => (l.item.id === id ? { ...l, quantity: l.quantity + 1 } : l)));
  }, []);

  const decrement = useCallback((id: string) => {
    setCart((c) =>
      c
        .map((l) => (l.item.id === id ? { ...l, quantity: Math.max(0, l.quantity - 1) } : l))
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setCart((c) => c.filter((l) => l.item.id !== id));
  }, []);

  const clear = useCallback(() => setCart([]), []);

  const addMenuItem = useCallback<Ctx["addMenuItem"]>((data) => {
    const item: MenuItem = { ...data, id: `m-${Date.now().toString(36)}` };
    setMenu((m) => [item, ...m]);
    return item;
  }, []);

  const updateMenuItem = useCallback<Ctx["updateMenuItem"]>((id, data) => {
    setMenu((m) => m.map((it) => (it.id === id ? { ...it, ...data } : it)));
    setCart((c) =>
      c.map((l) => (l.item.id === id ? { ...l, item: { ...l.item, ...data } } : l)),
    );
  }, []);

  const deleteMenuItem = useCallback<Ctx["deleteMenuItem"]>((id) => {
    setMenu((m) => m.filter((it) => it.id !== id));
    setCart((c) => c.filter((l) => l.item.id !== id));
  }, []);

  const total = useMemo(() => cart.reduce((s, l) => s + l.item.price * l.quantity, 0), [cart]);
  const profit = useMemo(
    () => cart.reduce((s, l) => s + (l.item.price - l.item.costPrice) * l.quantity, 0),
    [cart],
  );
  const itemCount = useMemo(() => cart.reduce((s, l) => s + l.quantity, 0), [cart]);

  const placeOrder = useCallback<Ctx["placeOrder"]>(
    (o) => {
      const order: Order = {
        id: `ORD-${Date.now().toString(36).toUpperCase()}`,
        items: cart,
        totalAmount: total,
        profit,
        createdAt: Date.now(),
        ...o,
      };
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      return order;
    },
    [cart, total, profit],
  );

  const value: Ctx = {
    cart,
    orders,
    menu,
    total,
    profit,
    itemCount,
    addItem,
    increment,
    decrement,
    remove,
    clear,
    placeOrder,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
  return <PosCtx.Provider value={value}>{children}</PosCtx.Provider>;
}

export function usePos() {
  const ctx = useContext(PosCtx);
  if (!ctx) throw new Error("usePos must be used within PosProvider");
  return ctx;
}
