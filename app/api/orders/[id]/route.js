import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { verifyAdmin } from "@/middleware/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  const { id } = await params;
  const authUser = verifyAdmin(req);
  if (!authUser) {
    return NextResponse.json({ error: "Admin access only" }, { status: 403 });
  }

  await connectDB();
  const body = await req.json();

  const order = await Order.findByIdAndUpdate(
    id,
    { status: body.status },
    { new: true }
  );

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}