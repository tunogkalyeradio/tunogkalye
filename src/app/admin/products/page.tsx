"use client";

import { useState, useTransition } from "react";
import {
  Package,
  Search,
  Filter,
  Eye,
  Power,
  PowerOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface ProductData {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;
  fulfillmentMode: string;
  createdAt: Date;
  artist: {
    id: number;
    bandName: string;
  };
  _count: { orderItems: number };
}

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ProductsContent({
  products,
  categories,
}: {
  products: ProductData[];
  categories: string[];
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [productStates, setProductStates] = useState<Record<number, ProductData>>(
    Object.fromEntries(products.map((p) => [p.id, p]))
  );

  const filteredProducts = Object.values(productStates).filter((product) => {
    const matchesSearch =
      search === "" ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.artist.bandName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.isActive) ||
      (statusFilter === "inactive" && !product.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const toggleActive = (productId: number) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/products/${productId}/toggle`, {
          method: "PATCH",
        });
        if (res.ok) {
          setProductStates((prev) => ({
            ...prev,
            [productId]: {
              ...prev[productId],
              isActive: !prev[productId].isActive,
            },
          }));
        }
      } catch {
        // silently fail
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Manage Products
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {products.length} total products &middot;{" "}
          {products.filter((p) => p.isActive).length} active
        </p>
      </div>

      {/* Filters */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search products or artists..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full border-white/10 bg-white/5 text-white sm:w-40">
                <Filter className="mr-2 h-4 w-4 text-slate-500" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#1a1a2e]">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full border-white/10 bg-white/5 text-white sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#1a1a2e]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">
                    Product
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-500 sm:table-cell">
                    Artist
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">
                    Price
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-500 md:table-cell">
                    Category
                  </th>
                  <th className="hidden px-4 py-3 text-center font-medium text-slate-500 sm:table-cell">
                    Stock
                  </th>
                  <th className="hidden px-4 py-3 text-center font-medium text-slate-500 lg:table-cell">
                    Fulfillment
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600/20 to-green-500/20 border border-emerald-500/20">
                          <Package className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="text-xs text-slate-500">
                            {product._count.orderItems} sold
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <Link
                        href={`/admin/artists/${product.artist.id}`}
                        className="text-sm text-purple-400 hover:text-purple-300"
                      >
                        {product.artist.bandName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-white">
                      {formatPeso(product.price)}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <Badge variant="outline" className="border-white/10 text-slate-400 text-xs">
                        {product.category}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-center sm:table-cell">
                      <span
                        className={
                          product.stock === 0
                            ? "text-red-400"
                            : product.stock < 10
                              ? "text-amber-400"
                              : "text-slate-400"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-center lg:table-cell">
                      <Badge
                        variant="outline"
                        className={
                          product.fulfillmentMode === "PLATFORM_DELIVERY"
                            ? "border-blue-500/30 text-blue-400 text-[10px]"
                            : "border-amber-500/30 text-amber-400 text-[10px]"
                        }
                      >
                        {product.fulfillmentMode === "PLATFORM_DELIVERY"
                          ? "Platform"
                          : "Self-Delivery"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        className={
                          product.isActive
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(product.id)}
                          disabled={isPending}
                          className={`h-8 ${
                            product.isActive
                              ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              : "text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          }`}
                          title={product.isActive ? "Deactivate" : "Activate"}
                        >
                          {product.isActive ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      {search || categoryFilter !== "all" || statusFilter !== "all"
                        ? "No products match your filters"
                        : "No products yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

export default async function ProductsPage() {
  await requireRole("ADMIN");

  const products = await db.product.findMany({
    include: {
      artist: { select: { id: true, bandName: true } },
      _count: { select: { orderItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = [...new Set(products.map((p) => p.category))].sort();

  const serializedProducts = products.map((p) => ({
    ...p,
    createdAt: new Date(p.createdAt),
    artist: { ...p.artist },
  }));

  return (
    <ProductsContent products={serializedProducts} categories={categories} />
  );
}
