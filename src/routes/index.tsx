import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/pos/Sidebar";
import { MenuGrid } from "@/components/pos/MenuGrid";
import { CartPanel } from "@/components/pos/CartPanel";

export const Route = createFileRoute("/")({
  component: PosPage,
  head: () => ({
    meta: [
      { title: "Crave POS — Take Orders" },
      { name: "description", content: "Lightning-fast order entry with cash, UPI and instant change calculation." },
    ],
  }),
});

function PosPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <MenuGrid />
        </div>
        <CartPanel />
      </main>
    </div>
  );
}
