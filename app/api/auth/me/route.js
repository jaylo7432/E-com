import { verifyToken } from "@/middleware/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ loggedIn: false }, { status: 200 });
  }
  return NextResponse.json({ loggedIn: true, user }, { status: 200 });
}