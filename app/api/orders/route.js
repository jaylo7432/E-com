import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { verifyToken, verifyAdmin } from "@/middleware/auth";
import { sendMail } from "@/lib/mailer";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
    const authUser = verifyToken(req);
    if (!authUser) {
         return NextResponse.json({ error: "Please login" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const viewAll = searchParams.get("all") === "true";

    if (viewAll) {
      const adminUser = verifyAdmin(req);
      if (!adminUser) {
        return NextResponse.json({ error: "Admin access only" }, { status: 403 });
      }
    }

    const filter = viewAll ? {} : { user: authUser.id };
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

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
        paymentMethod: body.paymentMethod || "Cash on Delivery",
    });

    const itemsList = body.items
      .map((i) => `<li>${i.name} x${i.qty} — ${(i.price * i.qty).toLocaleString()} baht</li>`)
      .join("");

    sendMail({
      to: authUser.email,
      subject: "Order Confirmation - My Shop",
      html: `
        <p>Payment method: ${body.paymentMethod || "Cash on Delivery"}</p>
        <ul>${itemsList}</ul>
        <p><strong>Total: ${body.total.toLocaleString()} baht</strong></p>
      `,
    });

    return NextResponse.json(order, { status: 201 });
}