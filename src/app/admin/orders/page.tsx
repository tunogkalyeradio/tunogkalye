import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import OrdersContent from "./orders-content";

export default async function OrdersPage() {
  try {
    await requireRole("ADMIN");
  } catch {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-400">Not authorized. Admin access required.</p>
      </div>
    );
  }

  let orders: any[] = [];
  try {
    orders = await db.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[OrdersPage] Error fetching orders:", error);
    orders = [];
  }

  // Serialize: handle null customer (guest orders) by falling back to guestName/guestEmail
  const serializedOrders = orders.map((o: any) => ({
    id: o.id,
    orderNumber: o.orderNumber || "",
    totalAmount: o.totalAmount ?? 0,
    platformRevenue: o.platformRevenue ?? 0,
    artistRevenueTotal: o.artistRevenueTotal ?? 0,
    status: o.status || "PENDING",
    createdAt: o.createdAt
      ? new Date(o.createdAt).toISOString()
      : new Date().toISOString(),
    customerName: o.customer?.name || o.guestName || "Guest",
    customerEmail: o.customer?.email || o.guestEmail || "—",
    _count: o._count || { orderItems: 0 },
  }));

  return <OrdersContent orders={serializedOrders} />;
}
