import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
  code: { type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true },
    discountType: { type: String, 
    enum: ["percent", "fixed"], 
    default: "percent" },
    discountValue: { type: Number, 
    required: true },
    active: { type: Boolean, 
    default: true },
    expiresAt: { type: Date },
    createdAt: { type: Date, 
    default: Date.now },
});

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);