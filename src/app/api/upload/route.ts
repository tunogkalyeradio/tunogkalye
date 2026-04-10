import { NextResponse } from "next/server";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/upload";

// POST: Upload an image
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided. Use 'image' field name." },
        { status: 400 }
      );
    }

    const result = await saveUploadedFile(file);

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      storage: result.storage,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("[UPLOAD ERROR]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE: Remove an uploaded image
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");
    const filename = searchParams.get("filename");
    const storage = searchParams.get("storage") as "cloudinary" | "local" | null;

    const identifier = publicId || filename;
    if (!identifier) {
      return NextResponse.json(
        { error: "publicId or filename query parameter required" },
        { status: 400 }
      );
    }

    await deleteUploadedFile(identifier, storage || undefined);

    return NextResponse.json({ success: true, message: "File deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    console.error("[UPLOAD DELETE ERROR]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
