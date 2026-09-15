import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { verifyToken } from "@/middleware/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
    const authUser = verifyToken(req);
    if (!authUser) {
         return NextResponse.json({ error: "Please login" }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find({ user: authUser.id }).sort({ createdAt: -1 });

    return NextResponse.json(orders);
}

export async function POST(req) {
    const authUser = verifyToken(req);
    if (!authUser) {
        return NextResponse.json({ error: "Please login" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    if (!body.items || body.items.length === 0) {
        return NextResponse.json({ error: "cart is empty" }, { status: 400 });
    }

    const order = await Order.create({
        user: authUser.id,
        items: body.items,
        total: body.total,
    });

    return NextResponse.json(order, { status: 201 });
}