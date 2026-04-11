import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Detect storage mode:
// 1. If any Cloudinary env var is set → Cloudinary (works on Vercel)
// 2. If running on Vercel (VERCEL env) → FORCE Cloudinary (local writes impossible)
// 3. Otherwise → local filesystem (dev)
function detectStorageMode(): "cloudinary" | "local" {
  const hasCloudinary =
    process.env.CLOUDINARY_URL ||
    process.env.CLOUDINARY_CLOUD_NAME;
  const isVercel = !!process.env.VERCEL;

  if (hasCloudinary) return "cloudinary";
  if (isVercel) return "cloudinary"; // Will fail with clear error if vars missing
  return "local";
}

const STORAGE_MODE = detectStorageMode();

function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || ".png";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}${ext}`;
}

// ─── Cloudinary Upload ────────────────────────────────────────────────────────

interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
}

async function uploadToCloudinary(
  file: File,
  folder: string = "tunogkalye"
): Promise<{ url: string; publicId: string }> {
  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;

  // Also try parsing CLOUDINARY_URL (cloudinary://key:secret@cloud_name)
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    const url = process.env.CLOUDINARY_URL;
    if (url) {
      try {
        const parsed = new URL(url);
        const parts = parsed.username ? parsed.username.split(":") : [];
        if (!CLOUD_NAME && parsed.hostname) {
          (process.env as Record<string, string>).CLOUDINARY_CLOUD_NAME = parsed.hostname;
        }
        if (!API_KEY && parts[0]) {
          (process.env as Record<string, string>).CLOUDINARY_API_KEY = parts[0];
        }
        if (!API_SECRET && parsed.password) {
          (process.env as Record<string, string>).CLOUDINARY_API_SECRET = parsed.password;
        }
      } catch {
        // Invalid CLOUDINARY_URL format
      }
    }
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Image uploads require Cloudinary on Vercel. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Vercel project environment variables. Get free credentials at https://cloudinary.com/users/register_free"
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  // Generate a unique public_id
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const publicId = `${folder}/${timestamp}-${random}`;

  // Build signature string
  const crypto = await import("crypto");
  const signatureStr = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

  const formData = new FormData();
  formData.append("file", base64);
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Cloudinary upload failed: ${errorData.error?.message || response.statusText}`
    );
  }

  const result: CloudinaryUploadResult = await response.json();
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

async function deleteFromCloudinary(publicId: string): Promise<void> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return;

  const timestamp = Date.now().toString();
  const crypto = await import("crypto");
  const signatureStr = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("timestamp", timestamp);
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body: formData,
  }).catch(() => {
    // Silently ignore deletion errors
  });
}

// ─── Local File Upload (dev only) ──────────────────────────────────────────────

async function saveToLocal(
  file: File
): Promise<{ url: string; filename: string }> {
  const filename = generateFilename(file.name);
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, filename);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  return {
    url: `/uploads/${filename}`,
    filename,
  };
}

async function deleteFromLocal(filename: string): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    await unlink(filePath);
  } catch {
    // File might not exist — ignore
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface UploadResult {
  url: string;
  publicId?: string; // Cloudinary public_id for deletion
  filename?: string; // Local filename for deletion
  storage: "cloudinary" | "local";
}

export async function saveUploadedFile(file: File): Promise<UploadResult> {
  // Validate type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type: ${file.type}. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`
    );
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: 5MB`
    );
  }

  if (STORAGE_MODE === "cloudinary") {
    const result = await uploadToCloudinary(file);
    return {
      url: result.url,
      publicId: result.publicId,
      storage: "cloudinary",
    };
  }

  const result = await saveToLocal(file);
  return {
    url: result.url,
    filename: result.filename,
    storage: "local",
  };
}

export async function deleteUploadedFile(
  identifier: string,
  storage?: "cloudinary" | "local"
): Promise<void> {
  const mode = storage || STORAGE_MODE;

  if (mode === "cloudinary") {
    // identifier is a publicId or URL containing the publicId
    await deleteFromCloudinary(identifier);
  } else {
    // identifier is a local filename
    await deleteFromLocal(identifier);
  }
}
