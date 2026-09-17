import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyAdmin } from "@/middleware/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { id } = await params;
  await connectDB();
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ error: "can't find product" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const user = verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Admin access only" }, { status: 403 });

  await connectDB();
  const body = await req.json();
  const product = await Product.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(product);
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const user = verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Admin access only" }, { status: 403 });

  await connectDB();
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ message: "delete complete" });
}