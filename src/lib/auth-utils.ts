import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

/**
 * Get the current session (works in Server Components and API routes).
 * Returns null if not authenticated.
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Get the current authenticated user from the database.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session?.user?.id) return null;

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) return null;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        artistProfile: {
          select: {
            id: true,
            bandName: true,
            genre: true,
            city: true,
            isVerified: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("[getCurrentUser] Error fetching user:", error);
    // If DB query fails, return a basic user object from session data
    const session = await getSession().catch(() => null);
    if (session?.user) {
      return {
        id: parseInt(session.user.id || "0", 10),
        email: session.user.email || "",
        name: session.user.name || "User",
        role: (session.user as any).role || "CUSTOMER",
        phone: null,
        avatar: session.user.image || null,
        createdAt: new Date(),
        artistProfile: null,
      };
    }
    return null;
  }
}

/**
 * Require authentication — throws an error or redirects if not logged in.
 * Use in Server Components or API routes.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Require a specific role — throws an error if user doesn't have the required role.
 * Use in Server Components or API routes.
 */
export async function requireRole(roles: UserRole | UserRole[]) {
  const user = await requireAuth();

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `Access denied. Required role: ${allowedRoles.join(", ")}`
    );
  }

  return user;
}

/**
 * Check if the current user has a specific role.
 * Returns boolean (safe to use in conditional rendering).
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await getSession();
  if (!session?.user) return false;

  const userRole = (session.user as { role?: string }).role;
  return userRole === role;
}

// Re-export authOptions for convenience
export { authOptions } from "@/lib/auth";
