import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CircleDollarSign, Receipt, Smartphone, TrendingUp, Wallet } from "lucide-react";
import { Sidebar } from "@/components/pos/Sidebar";
import { formatMoney } from "@/lib/pos/menu";
import { usePos, type Order } from "@/lib/pos/store";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  head: () => ({
    meta: [
      { title: "Crave POS — Reports" },
      { name: "description", content: "View total sales, profit, and order count at a glance." },
    ],
  }),
});

function ReportsPage() {
  const { orders } = usePos();
  const totalSales = orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalProfit = orders.reduce((s, o) => s + o.profit, 0);
  const totalOrders = orders.length;
  const cashOrders = orders.filter((o) => o.paymentMethod === "cash").length;
  const upiOrders = orders.filter((o) => o.paymentMethod === "upi").length;
  const cashPct = totalOrders > 0 ? Math.round((cashOrders / totalOrders) * 100) : 0;
  const upiPct = totalOrders > 0 ? Math.round((upiOrders / totalOrders) * 100) : 0;

  // Group orders by calendar date (most-recent date first, newest order first within a date)
  const grouped = orders
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .reduce<Record<string, Order[]>>((acc, o) => {
      const key = new Date(o.createdAt).toDateString();
      (acc[key] ||= []).push(o);
      return acc;
    }, {});
  const groupedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );
  const formatDateHeading = (key: string) => {
    const d = new Date(key);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (key === today) return "Today";
    if (key === yesterday) return "Yesterday";
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  const stats = [
    { label: "Total Sales", value: formatMoney(totalSales), icon: CircleDollarSign, tint: "primary" as const },
    { label: "Total Profit", value: formatMoney(totalProfit), icon: TrendingUp, tint: "success" as const },
    { label: "Orders", value: String(totalOrders), icon: Receipt, tint: "neutral" as const },
    {
      label: "Cash Orders",
      value: String(cashOrders),
      hint: totalOrders > 0 ? `${cashPct}% of orders` : undefined,
      icon: Wallet,
      tint: "neutral" as const,
    },
    {
      label: "UPI Orders",
      value: String(upiOrders),
      hint: totalOrders > 0 ? `${upiPct}% of orders` : undefined,
      icon: Smartphone,
      tint: "primary" as const,
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-text-secondary">Today</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft-sm)]"
            >
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
                  s.tint === "primary"
                    ? "bg-surface-alt text-primary-text"
                    : s.tint === "success"
                      ? "bg-[oklch(0.95_0.07_145)] text-success-text"
                      : "bg-surface-alt text-foreground"
                }`}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular">
                {s.value}
              </p>
              {s.hint && (
                <p className="mt-1 text-xs font-medium text-text-secondary tabular">{s.hint}</p>
              )}
            </motion.div>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Orders</h2>
          {orders.length === 0 ? (
            <div className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-soft-sm)]">
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt">
                  <Receipt className="h-7 w-7 text-text-secondary" />
                </div>
                <p className="text-sm font-semibold text-foreground">No orders yet</p>
                <p className="text-xs text-text-secondary">Completed orders will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedDates.map((dateKey) => {
                const dayOrders = grouped[dateKey];
                const daySales = dayOrders.reduce((s, o) => s + o.totalAmount, 0);
                return (
                  <div key={dateKey}>
                    <div className="mb-3 flex items-end justify-between px-1">
                      <h3 className="text-sm font-bold text-foreground">
                        {formatDateHeading(dateKey)}
                      </h3>
                      <p className="text-xs font-medium text-text-secondary tabular">
                        {dayOrders.length} {dayOrders.length === 1 ? "order" : "orders"} ·{" "}
                        {formatMoney(daySales)}
                      </p>
                    </div>
                    <div className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-soft-sm)]">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                            <th className="px-6 py-3">Order ID</th>
                            <th className="px-6 py-3">Time</th>
                            <th className="px-6 py-3">Items</th>
                            <th className="px-6 py-3">Method</th>
                            <th className="px-6 py-3 text-right">Profit</th>
                            <th className="px-6 py-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dayOrders.map((o) => (
                            <tr key={o.id} className="border-b border-border last:border-0">
                              <td className="px-6 py-4 font-semibold text-foreground tabular">
                                {o.id}
                              </td>
                              <td className="px-6 py-4 text-text-secondary tabular">
                                {formatTime(o.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-text-secondary">
                                {o.items.reduce((s, l) => s + l.quantity, 0)} items
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex h-6 items-center rounded-full bg-surface-alt px-2.5 text-xs font-semibold text-foreground">
                                  {o.paymentMethod === "cash" ? "Cash" : "UPI"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-success-text tabular">
                                {formatMoney(o.profit)}
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-foreground tabular">
                                {formatMoney(o.totalAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
