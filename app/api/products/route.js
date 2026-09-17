import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyAdmin } from "@/middleware/auth";
import { verifyToken } from "@/middleware/auth";
import { NextResponse } from "next/server";
import { verify } from "node:crypto";
export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();
  const products = await Product.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "product",
        as: "reviews",
      },
    },
    {
      $addFields: {
        avgRating: {
          $cond: [{ $gt: [{ $size: "$reviews" }, 0] }, { $avg: "$reviews.rating" }, 0],
        },
        reviewCount: { $size: "$reviews" },
      },
    },
    { $project: { reviews: 0 } },
  ]);
  return NextResponse.json(products);
}

export async function POST(req) {
    const user = verifyAdmin(req);
    if (!user) {
        return NextResponse.json({ error: "Admin access only" }, { status: 403 });
    }

  await connectDB();
  const body = await req.json();
  const product = await Product.create(body);
  return NextResponse.json(product, { status: 201 });
}