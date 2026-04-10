"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Package,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface StationProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  productType: string;
  images: string;
  stock: number;
  shippingFee: number;
  isActive: boolean;
  isStation: boolean;
  downloadUrl: string | null;
  fileSize: string | null;
  fileFormat: string | null;
  createdAt: string;
  artist: { id: number; bandName: string };
  _count: { orderItems: number };
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  category: "",
  productType: "PHYSICAL",
  images: "[]",
  sizes: "",
  colors: "",
  stock: "0",
  shippingFee: "0",
  downloadUrl: "",
  fileSize: "",
  fileFormat: "",
};

export default function StationMerchPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<StationProduct[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/station-merch");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      } else {
        setError("Failed to load station products.");
      }
    } catch {
      setError("Database may be unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: StationProduct) => {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
      category: p.category,
      productType: p.productType,
      images: p.images,
      sizes: "",
      colors: "",
      stock: String(p.stock),
      shippingFee: String(p.shippingFee),
      downloadUrl: p.downloadUrl || "",
      fileSize: p.fileSize || "",
      fileFormat: p.fileFormat || "",
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price || !form.category) return;
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/station-merch/${editingId}`
        : "/api/admin/station-merch";
      const method = editingId ? "PATCH" : "POST";

      const payload: Record<string, unknown> = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        category: form.category,
        productType: form.productType,
        images: form.images || "[]",
        stock: parseInt(form.stock, 10) || 0,
        shippingFee: parseFloat(form.shippingFee) || 0,
      };

      if (form.productType === "DIGITAL") {
        payload.downloadUrl = form.downloadUrl || null;
        payload.fileSize = form.fileSize || null;
        payload.fileFormat = form.fileFormat || null;
        payload.stock = 9999;
      }

      if (form.sizes) payload.sizes = form.sizes;
      if (form.colors) payload.colors = form.colors;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        fetchData();
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/station-merch/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: number, currentActive: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/station-merch/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: !currentActive } : p))
        );
      }
    } catch {
      // silently fail
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Station Merch
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage official TKR merchandise and products
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-500 hover:to-orange-400"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Station Product
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Product Grid / Table */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">
            Station Products ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <ShoppingBag className="mb-3 h-10 w-10 text-slate-600" />
              <p className="text-sm">No station products yet</p>
              <p className="text-xs text-slate-600">
                Add your first official TKR merchandise
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-slate-400">Product</TableHead>
                    <TableHead className="text-slate-400 hidden md:table-cell">Category</TableHead>
                    <TableHead className="text-slate-400">Price</TableHead>
                    <TableHead className="text-slate-400 hidden sm:table-cell">Type</TableHead>
                    <TableHead className="text-slate-400 hidden lg:table-cell">Stock</TableHead>
                    <TableHead className="text-slate-400 hidden lg:table-cell">Sales</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="border-white/5">
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="text-xs text-slate-500 max-w-[200px] truncate">
                            {product.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-slate-400">
                        <Badge
                          className="bg-white/10 text-slate-300 border-white/10"
                          variant="outline"
                        >
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {formatPeso(product.price)}
                        {product.compareAtPrice && (
                          <span className="ml-1 text-xs text-slate-500 line-through">
                            {formatPeso(product.compareAtPrice)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          className={
                            product.productType === "DIGITAL"
                              ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                          }
                          variant="outline"
                        >
                          {product.productType}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-slate-400">
                        {product.productType === "DIGITAL" ? "∞" : product.stock}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-slate-400">
                        {product._count.orderItems}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleToggle(product.id, product.isActive)}
                          disabled={togglingId === product.id}
                          className="flex items-center gap-1"
                        >
                          {togglingId === product.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                          ) : product.isActive ? (
                            <Eye className="h-3.5 w-3.5 text-green-400" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                          )}
                          <span
                            className={
                              product.isActive ? "text-green-400" : "text-slate-500"
                            }
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-slate-400 hover:text-white"
                            onClick={() => openEdit(product)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-white/10 bg-[#12121a] mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                {editingId ? "Edit Station Product" : "Add Station Product"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-slate-300">Product Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="e.g., TKR Logo Tee"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-slate-300">Description *</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="border-white/10 bg-white/5 text-white min-h-[80px]"
                  placeholder="Product description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">Compare at Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">Category *</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="e.g., T-Shirt, Album"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">Product Type</Label>
                  <Select
                    value={form.productType}
                    onValueChange={(v) => setForm((f) => ({ ...f, productType: v }))}
                  >
                    <SelectTrigger className="border-white/10 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      <SelectItem value="PHYSICAL">Physical</SelectItem>
                      <SelectItem value="DIGITAL">Digital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.productType === "DIGITAL" && (
                <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 space-y-3">
                  <p className="text-xs font-medium text-purple-400">Digital Product Settings</p>
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-300">Download URL</Label>
                    <Input
                      value={form.downloadUrl}
                      onChange={(e) => setForm((f) => ({ ...f, downloadUrl: e.target.value }))}
                      className="border-white/10 bg-white/5 text-white"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-300">File Size</Label>
                      <Input
                        value={form.fileSize}
                        onChange={(e) => setForm((f) => ({ ...f, fileSize: e.target.value }))}
                        className="border-white/10 bg-white/5 text-white"
                        placeholder="e.g., 45MB"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-300">File Format</Label>
                      <Input
                        value={form.fileFormat}
                        onChange={(e) => setForm((f) => ({ ...f, fileFormat: e.target.value }))}
                        className="border-white/10 bg-white/5 text-white"
                        placeholder="e.g., ZIP, MP3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.productType === "PHYSICAL" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-300">Stock</Label>
                    <Input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                      className="border-white/10 bg-white/5 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-300">Shipping Fee</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.shippingFee}
                      onChange={(e) => setForm((f) => ({ ...f, shippingFee: e.target.value }))}
                      className="border-white/10 bg-white/5 text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm text-slate-300">Image URLs (JSON array)</Label>
                <Input
                  value={form.images}
                  onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
                  className="border-white/10 bg-white/5 text-white font-mono text-xs"
                  placeholder='["https://..."]'
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  className="text-slate-400 hover:text-white"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-500 hover:to-orange-400"
                  disabled={
                    saving || !form.name || !form.description || !form.price || !form.category
                  }
                  onClick={handleSave}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
