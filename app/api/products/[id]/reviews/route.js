import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import User from "@/models/User";
import { verifyToken } from "@/middleware/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { id } = await params;
  await connectDB();
  const reviews = await Review.find({ product: id }).sort({ createdAt: -1 });
  return NextResponse.json(reviews);
}

export async function POST(req, { params }) {
  const { id } = await params;
  const authUser = verifyToken(req);
  if (!authUser) {
    return NextResponse.json({ error: "Please login to write a review" }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();
  const rating = Number(body.rating);
  const comment = body.comment || "";

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const userDoc = await User.findById(authUser.id);
  const review = await Review.create({
    product: id,
    userName: userDoc ? userDoc.name : "Anonymous",
    rating,
    comment,
  });

  return NextResponse.json(review, { status: 201 });
}