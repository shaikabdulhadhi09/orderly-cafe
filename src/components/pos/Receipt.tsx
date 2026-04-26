import { formatMoney } from "@/lib/pos/menu";
import type { Order } from "@/lib/pos/store";

const SHOP_NAME = "Crave Kitchen";
const SHOP_TAGLINE = "Fast • Fresh • Friendly";
const SHOP_ADDRESS = "221B Burger Lane, Foodville";
const SHOP_PHONE = "+1 (555) 012-3456";

/**
 * Hidden receipt rendered into the document so window.print() can pick it up.
 * Visually hidden on screen; revealed by the @media print rules in styles.css.
 */
export function Receipt({ order }: { order: Order | null }) {
  if (!order) return null;

  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString();
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const itemCount = order.items.reduce((s, l) => s + l.quantity, 0);

  return (
    <div
      id="print-receipt"
      aria-hidden="true"
      style={{
        position: "fixed",
        left: "-10000px",
        top: 0,
        width: "72mm",
        background: "#fff",
        color: "#000",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>{SHOP_NAME}</div>
        <div style={{ fontSize: 11 }}>{SHOP_TAGLINE}</div>
        <div style={{ fontSize: 11 }}>{SHOP_ADDRESS}</div>
        <div style={{ fontSize: 11 }}>{SHOP_PHONE}</div>
      </div>

      <Divider />

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
        <span>Order: {order.id}</span>
        <span>
          {dateStr} {timeStr}
        </span>
      </div>

      <Divider />

      {/* Items */}
      <div>
        {order.items.map((line) => {
          const subtotal = line.item.price * line.quantity;
          return (
            <div key={line.item.id} style={{ marginBottom: 4 }}>
              <div style={{ fontWeight: 700 }}>{line.item.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span>
                  {line.quantity} × {formatMoney(line.item.price)}
                </span>
                <span>{formatMoney(subtotal)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <Divider />

      <Row label={`Items (${itemCount})`} value={formatMoney(order.totalAmount)} />
      <Row label="TOTAL" value={formatMoney(order.totalAmount)} bold large />

      <Divider />

      <Row
        label="Payment"
        value={order.paymentMethod === "cash" ? "Cash" : "UPI / Online"}
      />
      {order.paymentMethod === "cash" && order.cashReceived !== undefined && (
        <>
          <Row label="Cash Received" value={formatMoney(order.cashReceived)} />
          <Row label="Change" value={formatMoney(order.change ?? 0)} />
        </>
      )}

      <Divider />

      <div style={{ textAlign: "center", marginTop: 8 }}>
        <div style={{ fontWeight: 700 }}>Thank You!</div>
        <div style={{ fontSize: 11 }}>Visit Again</div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        borderTop: "1px dashed #000",
        margin: "6px 0",
      }}
    />
  );
}

function Row({
  label,
  value,
  bold,
  large,
}: {
  label: string;
  value: string;
  bold?: boolean;
  large?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontWeight: bold ? 700 : 400,
        fontSize: large ? 14 : 12,
        margin: "1px 0",
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}