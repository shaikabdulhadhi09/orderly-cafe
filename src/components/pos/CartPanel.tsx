import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  Check,
  Minus,
  Plus,
  Printer,
  Receipt,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatMoney, PLACEHOLDER_IMAGE } from "@/lib/pos/menu";
import { usePos, type Order } from "@/lib/pos/store";
import { Receipt as PrintReceipt } from "./Receipt";

type Payment = "cash" | "upi";
type CashMode = "exact" | "manual";

export function CartPanel() {
  const { cart, total, profit, itemCount, increment, decrement, remove, clear, placeOrder } = usePos();

  const [payment, setPayment] = useState<Payment>("cash");
  const [cashMode, setCashMode] = useState<CashMode>("exact");
  const [manualCashStr, setManualCashStr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const printingRef = useRef(false);

  // Reset payment-state when cart empties
  useEffect(() => {
    if (cart.length === 0) {
      setManualCashStr("");
      setCashMode("exact");
    }
  }, [cart.length]);

  const manualCash = parseFloat(manualCashStr || "0") || 0;
  const cashReceived = payment === "cash" ? (cashMode === "exact" ? total : manualCash) : 0;
  const change = Math.max(0, cashReceived - total);

  const canSubmit = useMemo(() => {
    if (cart.length === 0) return false;
    if (payment === "upi") return true;
    if (cashMode === "exact") return true;
    return manualCash >= total && manualCashStr.length > 0;
  }, [cart.length, payment, cashMode, manualCash, total, manualCashStr]);

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 450));
    const order = placeOrder({
      paymentMethod: payment,
      cashReceived: payment === "cash" ? cashReceived : undefined,
      change: payment === "cash" ? change : undefined,
    });
    setSubmitting(false);
    setManualCashStr("");
    setLastOrder(order);
    toast.success(`Order ${order.id} confirmed`, {
      description: `${formatMoney(order.totalAmount)} • ${order.paymentMethod === "cash" ? "Cash" : "UPI / Online"}`,
    });
  };

  const handlePrint = useCallback(() => {
    if (!lastOrder || printingRef.current) return;
    printingRef.current = true;
    // Defer so the receipt definitely exists in the DOM, then release the lock
    // after the print dialog closes (resolves on focus return).
    requestAnimationFrame(() => {
      window.print();
      const release = () => {
        printingRef.current = false;
        window.removeEventListener("focus", release);
      };
      window.addEventListener("focus", release, { once: true });
    });
  }, [lastOrder]);

  return (
    <aside
      className="flex h-full w-[420px] flex-col bg-surface"
      style={{ boxShadow: "var(--shadow-left-edge)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-alt text-primary-text">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Current Order</h2>
            <p className="text-xs font-medium text-text-secondary tabular">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clear}
            className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-alt hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Cart list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <motion.ul layout className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {cart.map((line) => (
                <motion.li
                  key={line.item.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                  className="flex items-center gap-3 rounded-xl bg-surface-alt p-3"
                >
                  <img
                    src={line.item.image || PLACEHOLDER_IMAGE}
                    alt={line.item.name}
                    className="h-12 w-12 flex-shrink-0 rounded-lg object-cover ring-1 ring-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{line.item.name}</p>
                    <p className="text-xs font-semibold text-primary-text tabular">
                      {formatMoney(line.item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-surface p-1 shadow-[var(--shadow-soft-sm)]">
                    <button
                      onClick={() => decrement(line.item.id)}
                      aria-label="Decrease"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-alt"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-foreground tabular">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => increment(line.item.id)}
                      aria-label="Increase"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-accent"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(line.item.id)}
                    aria-label="Remove"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

      {/* Payment & summary */}
      <div className="border-t border-border bg-surface px-6 py-5">
        {/* Payment methods */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Payment Method
        </p>
        <div className="grid grid-cols-2 gap-2">
          <PayBtn active={payment === "cash"} onClick={() => setPayment("cash")} icon={<Banknote className="h-4 w-4" />} label="Cash" />
          <PayBtn active={payment === "upi"} onClick={() => setPayment("upi")} icon={<Smartphone className="h-4 w-4" />} label="UPI / Online" />
        </div>

        {/* Cash sub-panel */}
        <AnimatePresence initial={false}>
          {payment === "cash" && (
            <motion.div
              key="cash-panel"
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 12 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="rounded-xl bg-surface-alt p-3">
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface p-1">
                  <SegBtn active={cashMode === "exact"} onClick={() => setCashMode("exact")} label="Exact Amount" />
                  <SegBtn active={cashMode === "manual"} onClick={() => setCashMode("manual")} label="Manual Entry" />
                </div>
                <AnimatePresence initial={false} mode="wait">
                  {cashMode === "manual" ? (
                    <motion.div
                      key="manual"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="mt-3"
                    >
                      <label className="mb-1 block text-xs font-semibold text-text-secondary">
                        Cash Received
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={manualCashStr}
                        onChange={(e) => setManualCashStr(e.target.value)}
                        placeholder="0.00"
                        className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-lg font-bold text-foreground tabular outline-none transition-colors focus:border-primary"
                      />
                      {manualCashStr.length > 0 && manualCash < total && (
                        <p className="mt-1.5 text-xs font-medium text-text-secondary">
                          Need {formatMoney(total - manualCash)} more.
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.p
                      key="exact"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 text-center text-xs font-medium text-text-secondary"
                    >
                      Customer pays exact amount — no change required.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary */}
        <div className="mt-4 space-y-1.5">
          <Row label="Profit" value={formatMoney(profit)} muted />
          {payment === "cash" && (
            <>
              <Row label="Cash Received" value={formatMoney(cashReceived)} muted />
              <Row label="Change" value={formatMoney(change)} highlight={change > 0} />
            </>
          )}
          <div className="flex items-end justify-between pt-2">
            <span className="text-sm font-semibold text-text-secondary">Total</span>
            <span className="text-3xl font-bold tracking-tight text-foreground tabular">
              {formatMoney(total)}
            </span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!canSubmit || submitting}
          className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-[var(--shadow-soft-md)] transition-all duration-200 ease-[var(--ease-settle)] hover:bg-accent active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-text-secondary disabled:shadow-none"
        >
          {submitting ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
              Processing…
            </motion.span>
          ) : (
            <>
              <Check className="h-5 w-5" />
              Generate Bill
            </>
          )}
        </button>

        <AnimatePresence initial={false}>
          {lastOrder && (
            <motion.button
              key="print"
              type="button"
              onClick={handlePrint}
              initial={{ opacity: 0, y: -4, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto", marginTop: 8 }}
              exit={{ opacity: 0, y: -4, height: 0, marginTop: 0 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-border bg-surface text-sm font-semibold text-foreground shadow-[var(--shadow-soft-sm)] transition-colors hover:bg-surface-alt"
            >
              <Printer className="h-4 w-4" />
              Print Bill — {lastOrder.id}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden on screen; revealed by @media print rules in styles.css */}
      <PrintReceipt order={lastOrder} />
    </aside>
  );
}

function PayBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-14 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all duration-200 ease-[var(--ease-settle)] ${
        active
          ? "border-primary bg-surface-alt text-primary-text shadow-[var(--shadow-soft-sm)]"
          : "border-border bg-surface text-text-secondary hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SegBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 rounded-md text-xs font-semibold transition-all duration-200 ease-[var(--ease-settle)] ${
        active ? "bg-surface-alt text-primary-text" : "text-text-secondary hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function Row({ label, value, muted, highlight }: { label: string; value: string; muted?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? "text-text-secondary" : "text-foreground"}>{label}</span>
      <span
        className={`font-semibold tabular ${
          highlight ? "text-success-text" : muted ? "text-text-secondary" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-alt">
        <Receipt className="h-9 w-9 text-text-secondary" />
      </div>
      <p className="text-sm font-semibold text-foreground">Your cart is empty</p>
      <p className="max-w-[220px] text-xs leading-relaxed text-text-secondary">
        Select items from the menu to start an order.
      </p>
    </div>
  );
}
