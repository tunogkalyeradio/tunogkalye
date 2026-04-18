import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const submissionSchema = z.object({
  bandName: z.string().min(2, "Band name is required"),
  realName: z.string().min(2, "Real name is required"),
  email: z.string().email("Valid email is required"),
  spotifyLink: z.string().url().optional().or(z.literal("")),
  soundcloudLink: z.string().url().optional().or(z.literal("")),
  city: z.string().min(2, "City is required"),
  genre: z.string().optional(),
  message: z.string().optional(),
  broadcastConsent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the broadcast license to submit your music.",
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = submissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const submission = await db.musicSubmission.create({
      data: {
        bandName: data.bandName,
        realName: data.realName,
        email: data.email,
        spotifyLink: data.spotifyLink || null,
        soundcloudLink: data.soundcloudLink || null,
        city: data.city,
        genre: data.genre || null,
        message: data.message || null,
        broadcastConsent: data.broadcastConsent,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      id: submission.id,
      message: "Demo submitted successfully!",
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Failed to process submission. Please try again." },
      { status: 500 }
    );
  }
}
