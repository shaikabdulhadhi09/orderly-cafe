import { Link, useLocation } from "@tanstack/react-router";
import { LayoutGrid, BarChart3, UtensilsCrossed, BookOpen } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutGrid, label: "POS" },
  { to: "/menu", icon: BookOpen, label: "Menu" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
] as const;

export function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="flex h-full w-20 flex-col items-center justify-between border-r border-border bg-surface py-6">
      <div className="flex flex-col items-center gap-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-soft-md)]">
          <UtensilsCrossed className="h-6 w-6" />
        </div>
        <nav className="flex flex-col gap-3">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                aria-label={label}
                className={`group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ease-[var(--ease-settle)] ${
                  active
                    ? "bg-surface-alt text-primary-text"
                    : "text-text-secondary hover:bg-surface-alt hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {active && (
                  <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-alt text-sm font-semibold text-foreground">
        SR
      </div>
    </aside>
  );
}
