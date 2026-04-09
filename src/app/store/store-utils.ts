// Shared store constants and types (no DB imports — safe for client components)

export const CATEGORY_GRADIENTS: Record<string, string> = {
  "T-Shirt": "from-red-600 to-orange-500",
  Hoodie: "from-purple-600 to-pink-500",
  Longsleeve: "from-blue-600 to-cyan-500",
  Cap: "from-amber-500 to-yellow-400",
  Sticker: "from-green-500 to-emerald-400",
  Poster: "from-rose-500 to-pink-400",
  Digital: "from-violet-600 to-purple-400",
};

export const CATEGORIES = [
  "All",
  "T-Shirt",
  "Hoodie",
  "Longsleeve",
  "Cap",
  "Sticker",
  "Poster",
  "Digital",
];

export interface StoreProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  shippingFee: number;
  category: string;
  images: string[];
  sizes: string[] | null;
  colors: string[] | null;
  stock: number;
  fulfillmentMode: string;
  createdAt: string;
  updatedAt: string;
  artist: {
    id: number;
    bandName: string;
    genre: string | null;
    city: string;
    isVerified: boolean;
    imageUrl: string | null;
  } | null;
}

export interface FeaturedArtist {
  id: number;
  bandName: string;
  genre: string | null;
  city: string;
  isVerified: boolean;
  imageUrl: string | null;
}
