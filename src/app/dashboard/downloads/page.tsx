"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  FileArchive,
  Loader2,
  Music,
  HardDrive,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DigitalPurchase {
  id: number;
  fileName: string | null;
  fileFormat: string | null;
  fileSize: string | null;
  downloadUrl: string;
  downloadCount: number;
  maxDownloads: number;
  createdAt: string;
  product: {
    id: number;
    name: string;
    images: string;
  };
  artist: {
    bandName: string;
  };
}

export default function DownloadsPage() {
  const [purchases, setPurchases] = useState<DigitalPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDownloads = useCallback(async () => {
    try {
      const res = await fetch("/api/user/badges?downloads=true");
      if (res.ok) {
        const data = await res.json();
        setPurchases(data.downloads || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Digital Vault
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Your purchased digital downloads — albums, EPs, and more
        </p>
      </div>

      {purchases.length === 0 ? (
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <Download className="h-8 w-8 text-slate-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No digital purchases yet</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Browse the merch store for exclusive albums and downloads from your favorite Filipino indie artists!
              </p>
            </div>
            <Link href="/store">
              <Button className="bg-gradient-to-r from-red-600 to-orange-500 font-bold text-white hover:from-red-500 hover:to-orange-400">
                Browse Store
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {purchases.map((item) => {
            const remaining = item.maxDownloads - item.downloadCount;
            const exhausted = remaining <= 0;

            let imageUrl: string | null = null;
            try {
              const imgs = JSON.parse(item.product.images);
              if (Array.isArray(imgs) && imgs.length > 0) imageUrl = imgs[0];
            } catch {
              // ignore
            }

            return (
              <Card key={item.id} className="border-white/10 bg-[#12121a]">
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                    ) : (
                      <FileArchive className="h-6 w-6 text-slate-600" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-sm font-bold text-white">
                      {item.fileName || item.product.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {item.fileFormat && (
                        <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-[10px] text-purple-400">
                          <HardDrive className="mr-0.5 h-2.5 w-2.5" />
                          {item.fileFormat}
                        </Badge>
                      )}
                      {item.fileSize && (
                        <span className="text-[10px] text-slate-500">{item.fileSize}</span>
                      )}
                      <span className="text-[10px] text-slate-600">
                        by {item.artist.bandName}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Purchased {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>

                  {/* Download */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!exhausted ? (
                      <Button
                        size="sm"
                        onClick={() => window.open(item.downloadUrl, "_blank")}
                        className="bg-gradient-to-r from-purple-600 to-blue-500 text-xs font-bold text-white hover:from-purple-500 hover:to-blue-400"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Download
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-[10px] text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        Exhausted
                      </div>
                    )}
                    <span className={`text-[10px] ${exhausted ? "text-red-400" : "text-slate-500"}`}>
                      {remaining} of {item.maxDownloads} downloads remaining
                    </span>
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
