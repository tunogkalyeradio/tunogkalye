import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasTursoUrl: !!process.env.STORAGE_TURSO_DATABASE_URL,
    hasTursoToken: !!process.env.STORAGE_TURSO_AUTH_TOKEN,
    tursoUrlPrefix: process.env.STORAGE_TURSO_DATABASE_URL?.substring(0, 20) || "undefined",
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(k => 
      k.includes('DATABASE') || k.includes('TURSO') || k.includes('NEXTAUTH') || k.includes('SECRET') || k.includes('URL')
    ),
  });
}
