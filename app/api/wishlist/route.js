import { connectDB } from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";
import { verifyToken } from "@/middleware/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const authUser = verifyToken(req);
  if (!authUser) {
    return NextResponse.json({ error: "Please login" }, { status: 401 });
  }

  await connectDB();
  const items = await Wishlist.find({ user: authUser.id }).populate("product");
  const products = items.filter((i) => i.product).map((i) => i.product);

  return NextResponse.json(products);
}

export async function POST(req) {
  const authUser = verifyToken(req);
  if (!authUser) {
    return NextResponse.json({ error: "Please login" }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();

  try {
    await Wishlist.create({ user: authUser.id, product: body.productId });
  } catch (err) {

    if (err.code !== 11000) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Added to wishlist" }, { status: 201 });
}

export async function DELETE(req) {
  const authUser = verifyToken(req);
  if (!authUser) {
    return NextResponse.json({ error: "Please login" }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  await Wishlist.deleteOne({ user: authUser.id, product: productId });

  return NextResponse.json({ message: "Removed from wishlist" });
}