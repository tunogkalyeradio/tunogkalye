import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, bandName, city } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = [UserRole.CUSTOMER, UserRole.ARTIST];
    const userRole = role === "ARTIST" ? UserRole.ARTIST : UserRole.CUSTOMER;
    if (!validRoles.includes(userRole)) {
      return NextResponse.json(
        { error: "Invalid role. Must be CUSTOMER or ARTIST" },
        { status: 400 }
      );
    }

    // Artist-specific validation
    if (userRole === UserRole.ARTIST) {
      if (!bandName) {
        return NextResponse.json(
          { error: "Band name is required for artists" },
          { status: 400 }
        );
      }
      if (!city) {
        return NextResponse.json(
          { error: "City is required for artists" },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: userRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // If artist, create artist profile
    if (userRole === UserRole.ARTIST) {
      await db.artistProfile.create({
        data: {
          userId: user.id,
          bandName,
          realName: name,
          city,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: userRole === UserRole.ARTIST
          ? "Artist account created successfully! You can now sign in."
          : "Account created successfully! You can now sign in.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
