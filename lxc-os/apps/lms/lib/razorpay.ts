import Razorpay from "razorpay"

if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
  throw new Error("RAZORPAY_KEY or RAZORPAY_SECRET is missing in environment variables")
}

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
})
