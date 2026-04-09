"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderData {
  id: number;
  orderNumber: string;
  totalAmount: number;
  platformRevenue: number;
  artistRevenueTotal: number;
  status: string;
  createdAt: Date;
  customer: {
    name: string;
    email: string;
  };
  _count: { orderItems: number };
}

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PAID: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PROCESSING: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  SHIPPED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  DELIVERED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusOptions = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const PAGE_SIZE = 20;

function OrdersContent({ orders }: { orders: OrderData[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      search === "" ||
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Manage Orders
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {orders.length} total orders &middot;{" "}
          {formatPeso(orders.reduce((s, o) => s + o.totalAmount, 0))} total
          sales
        </p>
      </div>

      {/* Filters */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search by order #, customer name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full border-white/10 bg-white/5 text-white sm:w-44">
                <Filter className="mr-2 h-4 w-4 text-slate-500" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#1a1a2e]">
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">
                    Order #
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-500 sm:table-cell">
                    Customer
                  </th>
                  <th className="hidden px-4 py-3 text-center font-medium text-slate-500 md:table-cell">
                    Items
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">
                    Total
                  </th>
                  <th className="hidden px-4 py-3 text-right font-medium text-slate-500 lg:table-cell">
                    Platform Cut
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-500">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-500 md:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {order.orderNumber}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div>
                        <p className="text-slate-300">{order.customer.name}</p>
                        <p className="text-xs text-slate-500">
                          {order.customer.email}
                        </p>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-center md:table-cell text-slate-400">
                      {order._count.orderItems}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-white">
                      {formatPeso(order.totalAmount)}
                    </td>
                    <td className="hidden px-4 py-3 text-right lg:table-cell text-red-400">
                      {formatPeso(order.platformRevenue)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant="outline"
                        className={
                          statusColors[order.status] ||
                          "bg-slate-500/20 text-slate-400"
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-slate-400 hover:text-white"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      {search || statusFilter !== "all"
                        ? "No orders match your filters"
                        : "No orders yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filteredOrders.length)} of{" "}
            {filteredOrders.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-400">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

export default async function OrdersPage() {
  await requireRole("ADMIN");

  const orders = await db.order.findMany({
    include: {
      customer: { select: { name: true, email: true } },
      _count: { select: { orderItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedOrders = orders.map((o) => ({
    ...o,
    createdAt: new Date(o.createdAt),
    customer: { ...o.customer },
  }));

  return <OrdersContent orders={serializedOrders} />;
}
