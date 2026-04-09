"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ImageUpload from "@/components/image-upload";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormProps {
  product?: {
    id: number;
    name: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    category: string;
    images: string;
    sizes: string | null;
    colors: string | null;
    stock: number;
    fulfillmentMode: string;
    shippingFee: number;
  };
}

const CATEGORIES = [
  "T-Shirt",
  "Hoodie",
  "Longsleeve",
  "Cap",
  "Sticker",
  "Poster",
  "Digital",
  "Other",
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Parse initial images
  const initialImages: string[] = [];
  if (product?.images) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed)) initialImages.push(...parsed.filter(Boolean));
    } catch {
      if (product.images) initialImages.push(product.images);
    }
  }

  // Parse initial sizes
  const initialSizes: string[] = [];
  if (product?.sizes) {
    try {
      const parsed = JSON.parse(product.sizes);
      if (Array.isArray(parsed)) initialSizes.push(...parsed);
    } catch {
      // ignore
    }
  }

  // Parse initial colors
  const initialColors = product?.colors || "";

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(String(product?.price || ""));
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice ? String(product.compareAtPrice) : ""
  );
  const [category, setCategory] = useState(product?.category || "");
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages);
  const [sizes, setSizes] = useState<string[]>(initialSizes);
  const [colors, setColors] = useState(initialColors);
  const [stock, setStock] = useState(String(product?.stock || ""));
  const [fulfillmentMode, setFulfillmentMode] = useState(
    product?.fulfillmentMode || "PLATFORM_DELIVERY"
  );
  const [shippingFee, setShippingFee] = useState(
    String(product?.shippingFee || "0")
  );

  const toggleSize = (size: string) => {
    setSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  };

  const handleSave = async () => {
    if (!name.trim() || !price || !category || !stock) {
      setError("Please fill in all required fields.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Price must be a positive number.");
      return;
    }

    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setError("Stock must be a non-negative number.");
      return;
    }

    setSaving(true);
    setError("");

    const body = {
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      category,
      images: JSON.stringify(imageUrls),
      sizes: sizes.length > 0 ? JSON.stringify(sizes) : null,
      colors: colors.trim() || null,
      stock: stockNum,
      fulfillmentMode,
      shippingFee: parseFloat(shippingFee) || 0,
    };

    try {
      const url = isEditing
        ? `/api/artist/products/${product.id}`
        : "/api/artist/products";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/artist/products");
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isEditing
              ? "Update your product details"
              : "Add a new merchandise item to your store"}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader>
              <CardTitle className="text-base text-white">
                Product Details
              </CardTitle>
              <CardDescription>
                Basic information about your merchandise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm text-slate-300">
                  Product Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  placeholder="e.g., Official Band T-Shirt"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-slate-300">Description</Label>
                <Textarea
                  placeholder="Describe your product, materials, fit, etc."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">
                    Price (₱) <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">
                    Compare at Price (₱)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Optional — shows discount"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-slate-300">
                  Category <span className="text-red-400">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#12121a]">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader>
              <CardTitle className="text-base text-white">
                Product Images
              </CardTitle>
              <CardDescription>
                Upload images for your product (max 5)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={imageUrls}
                onChange={(urls) => setImageUrls(typeof urls === "string" ? [urls] : urls)}
                multiple
                maxImages={5}
                accent="blue"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Inventory */}
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader>
              <CardTitle className="text-base text-white">
                Inventory & Shipping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm text-slate-300">
                  Stock Quantity <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                />
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <Label className="text-sm text-slate-300">Sizes</Label>
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((size) => (
                    <label
                      key={size}
                      className="flex cursor-pointer items-center gap-1.5"
                    >
                      <Checkbox
                        checked={sizes.includes(size)}
                        onCheckedChange={() => toggleSize(size)}
                        className="border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                      <span className="text-xs text-slate-300">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <Label className="text-sm text-slate-300">
                  Colors (comma-separated)
                </Label>
                <Input
                  placeholder="Black, White, Navy"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fulfillment */}
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader>
              <CardTitle className="text-base text-white">
                Fulfillment
              </CardTitle>
              <CardDescription>
                How will this product be delivered?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Select value={fulfillmentMode} onValueChange={setFulfillmentMode}>
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#12121a]">
                    <SelectItem value="ARTIST_SELF_DELIVERY">
                      I will ship myself
                    </SelectItem>
                    <SelectItem value="PLATFORM_DELIVERY">
                      Platform will handle delivery
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-slate-300">
                  Shipping Fee (₱)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                />
                <p className="text-xs text-slate-500">
                  Set to 0 for free shipping
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-5 text-base font-bold text-white hover:from-blue-400 hover:to-purple-400 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Product"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/artist/products")}
              className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
