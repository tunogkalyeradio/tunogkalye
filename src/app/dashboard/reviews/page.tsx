"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Star,
  Plus,
  ImageOff,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  product: {
    name: string;
    images: string;
  };
}

interface UnreviewedProduct {
  id: number;
  name: string;
  images: string;
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function getFirstImage(images: string): string | null {
  try {
    const arr = JSON.parse(images);
    if (Array.isArray(arr) && arr.length > 0) return arr[0];
  } catch {}
  return null;
}

function StarRating({
  rating,
  onRate,
  interactive = false,
  size = "sm",
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: "sm" | "md";
}) {
  const [hovered, setHovered] = useState(0);
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`transition-colors ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        >
          <Star
            className={`${iconSize} ${
              star <= (hovered || rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-slate-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [unreviewedProducts, setUnreviewedProducts] = useState<
    UnreviewedProduct[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);

  // Review form state
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setUnreviewedProducts(data.unreviewedProducts || []);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = async (productId: number) => {
    setSubmitting(productId);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: formRating,
          comment: formComment.trim() || null,
        }),
      });
      if (res.ok) {
        setOpenDialogId(null);
        setFormRating(5);
        setFormComment("");
        fetchReviews();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setSubmitting(null);
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
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            My Reviews
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} written
            {unreviewedProducts.length > 0 &&
              ` · ${unreviewedProducts.length} item${unreviewedProducts.length !== 1 ? "s" : ""} waiting for review`}
          </p>
        </div>
      </div>

      {/* Write a Review prompt */}
      {unreviewedProducts.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Products waiting for your review
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Share your experience to help other fans discover great merch!
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {unreviewedProducts.map((product) => (
                <Dialog
                  key={product.id}
                  open={openDialogId === product.id}
                  onOpenChange={(open) => {
                    if (open) {
                      setOpenDialogId(product.id);
                      setFormRating(5);
                      setFormComment("");
                    } else {
                      setOpenDialogId(null);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
                    >
                      <Plus className="mr-1.5 h-3 w-3" />
                      {product.name}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-white/10 bg-[#12121a] text-white sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-base">
                        Review: {product.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                          Your Rating
                        </label>
                        <StarRating
                          rating={formRating}
                          onRate={setFormRating}
                          interactive
                          size="md"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                          Comment (optional)
                        </label>
                        <Textarea
                          value={formComment}
                          onChange={(e) => setFormComment(e.target.value)}
                          placeholder="Share your thoughts about this product..."
                          rows={3}
                          className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setOpenDialogId(null)}
                          className="text-sm text-slate-400 hover:text-white"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => submitReview(product.id)}
                          disabled={submitting === product.id || formRating === 0}
                          className="bg-gradient-to-r from-red-600 to-orange-500 text-sm font-bold text-white hover:from-red-500 hover:to-orange-400 disabled:opacity-50"
                        >
                          {submitting === product.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Review"
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 text-6xl">⭐</div>
            <h2 className="text-lg font-bold text-white">No reviews yet</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Once you purchase and receive items, you can leave reviews to help
              other fans find great merch.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const imageUrl = getFirstImage(review.product.images);
            return (
              <Card
                key={review.id}
                className="border-white/10 bg-[#12121a] transition-all hover:border-white/20"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex gap-4">
                    {/* Product thumbnail */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={review.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageOff className="h-5 w-5 text-slate-600" />
                      )}
                    </div>

                    {/* Review content */}
                    <div className="flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">
                            {review.product.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} />
                            <span className="text-xs text-slate-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                        <Badge className="self-start border-amber-500/30 bg-amber-500/20 text-[10px] text-amber-400">
                          {review.rating}/5
                        </Badge>
                      </div>
                      {review.comment && (
                        <div className="mt-2 flex items-start gap-2 rounded-lg bg-white/[0.02] p-3">
                          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      )}
                    </div>
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
