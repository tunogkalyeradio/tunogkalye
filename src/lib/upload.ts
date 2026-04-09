import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || ".png";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}${ext}`;
}

export async function saveUploadedFile(file: File): Promise<{ url: string; filename: string }> {
  // Validate type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`);
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: 5MB`);
  }

  const filename = generateFilename(file.name);
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  // Ensure directory exists
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

export async function deleteUploadedFile(filename: string): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    const { unlink } = await import("fs/promises");
    await unlink(filePath);
  } catch {
    // File might not exist — ignore
  }
}
