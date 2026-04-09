"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  ImageIcon,
  ShoppingCart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: number;
  name: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  stock: number;
  isActive: boolean;
  images: string;
  fulfillmentMode: string;
  _count: { orderItems: number };
}

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

const categories = [
  "All",
  "T-Shirt",
  "Hoodie",
  "Longsleeve",
  "Cap",
  "Sticker",
  "Poster",
  "Digital",
  "Other",
];

export default function ArtistProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/artist/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleActive = async (id: number, currentState: boolean) => {
    try {
      const res = await fetch(`/api/artist/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: !currentState } : p))
        );
      }
    } catch {
      // ignore
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/artist/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const filteredProducts = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
    if (statusFilter === "Active" && !p.isActive) return false;
    if (statusFilter === "Inactive" && p.isActive) return false;
    return true;
  });

  const getFirstImage = (images: string) => {
    try {
      const arr = JSON.parse(images);
      if (Array.isArray(arr) && arr.length > 0) return arr[0];
    } catch {
      // ignore
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Merch</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your products and inventory
          </p>
        </div>
        <Link href="/artist/products/new">
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400">
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-600"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full border-white/10 bg-white/5 text-white sm:w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#12121a]">
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full border-white/10 bg-white/5 text-white sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#12121a]">
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="mb-4 h-12 w-12 text-slate-600" />
            <h3 className="text-lg font-medium text-white">No products found</h3>
            <p className="mt-1 mb-4 text-sm text-slate-400">
              {products.length === 0
                ? "Start by adding your first merchandise item"
                : "Try adjusting your filters"}
            </p>
            {products.length === 0 && (
              <Link href="/artist/products/new">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const firstImage = getFirstImage(product.images);
            const hasDiscount =
              product.compareAtPrice && product.compareAtPrice > product.price;

            return (
              <Card
                key={product.id}
                className="overflow-hidden border-white/10 bg-[#12121a] transition-all hover:border-white/20"
              >
                {/* Product Image */}
                <div className="relative aspect-video bg-[#0a0a0f]">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-slate-700" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2 flex gap-1.5">
                    <Badge
                      variant="outline"
                      className={`border-white/20 bg-black/60 text-[10px] font-medium backdrop-blur-sm ${
                        product.isActive
                          ? "text-green-400"
                          : "text-slate-400"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-sm font-medium text-white">
                      {product.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-white/10 text-[10px] text-slate-400"
                    >
                      {product.category}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-500">
                    {product.fulfillmentMode === "ARTIST_SELF_DELIVERY"
                      ? "Self-delivery"
                      : "Platform delivery"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">
                      {formatPeso(product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-slate-500 line-through">
                        {formatPeso(product.compareAtPrice!)}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <ShoppingCart className="h-3 w-3" />
                      {product._count.orderItems} orders
                    </span>
                    <span
                      className={
                        product.stock > 10
                          ? "text-green-400"
                          : product.stock > 0
                          ? "text-amber-400"
                          : "text-red-400"
                      }
                    >
                      {product.stock} in stock
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/artist/products/${product.id}/edit`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                      >
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(product.id, product.isActive)}
                      className={`border-white/10 ${
                        product.isActive
                          ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      {product.isActive ? (
                        <ToggleRight className="h-3.5 w-3.5" />
                      ) : (
                        <ToggleLeft className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                      className="border-white/10 bg-white/5 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
