import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { CATEGORIES, formatMoney, MENU, type Category } from "@/lib/pos/menu";
import { usePos } from "@/lib/pos/store";

export function MenuGrid() {
  const { addItem } = usePos();
  const [cat, setCat] = useState<Category>("All");
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    return MENU.filter((m) => (cat === "All" ? true : m.category === cat)).filter((m) =>
      m.name.toLowerCase().includes(q.toLowerCase()),
    );
  }, [cat, q]);

  return (
    <section className="flex h-full flex-col gap-6 overflow-hidden p-6">
      <header className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-text-secondary">Welcome back</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
              What would you like to order?
            </h1>
          </div>
          <div className="relative w-72 max-w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search menu…"
              className="h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-4 text-sm text-foreground shadow-[var(--shadow-soft-sm)] outline-none transition-colors focus:border-primary"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = c === cat;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`h-10 rounded-full px-5 text-sm font-semibold transition-all duration-200 ease-[var(--ease-settle)] ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft-md)]"
                    : "bg-surface text-text-secondary hover:text-foreground"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-1">
        <ul className="grid grid-cols-1 gap-5 pb-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {items.map((m) => (
            <motion.li
              key={m.id}
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <button
                onClick={() => addItem(m)}
                className="group flex w-full flex-col overflow-hidden rounded-2xl bg-surface text-left shadow-[var(--shadow-soft-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-soft-md)]"
              >
                <div className="aspect-[5/4] w-full overflow-hidden bg-surface-alt">
                  <img
                    src={m.image}
                    alt={m.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 ease-[var(--ease-settle)] group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <p className="text-base font-semibold leading-tight text-foreground text-balance">
                    {m.name}
                  </p>
                  <p className="text-xs font-medium text-text-secondary tabular">
                    cost {formatMoney(m.costPrice)}
                  </p>
                  <p className="mt-2 text-lg font-bold text-primary-text tabular">
                    {formatMoney(m.price)}
                  </p>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>
        {items.length === 0 && (
          <div className="flex h-48 items-center justify-center text-text-secondary">
            No items match your search.
          </div>
        )}
      </div>
    </section>
  );
}
