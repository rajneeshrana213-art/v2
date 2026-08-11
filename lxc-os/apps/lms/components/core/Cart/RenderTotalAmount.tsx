import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"
import { toast } from "react-hot-toast"
import IconBtn from "../../Common/IconBtn"
import { resetCart } from "../../../lib/state/slices/cart-slice"

export default function RenderTotalAmount() {
  const { total, cart } = useSelector((state: any) => state.cart)
  const { user } = useSelector((state: any) => state.profile)
  const router = useRouter()
  const dispatch = useDispatch()

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = src
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleBuyCourse = async () => {
    const toastId = toast.loading("Initiating Payment...")
    try {
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")
      if (!res) {
        toast.error("Razorpay SDK failed to load.")
        return
      }

      const courses = cart.map((course: any) => course.id)
      
      // 1. Capture Payment (Create Order)
      const captureResponse = await fetch("/api/payment/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courses }),
      })
      const captureData = await captureResponse.json()
      if (!captureData.success) throw new Error(captureData.message)

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        currency: captureData.data.currency,
        amount: `${captureData.data.amount}`,
        order_id: captureData.data.id,
        name: "LearnXChain",
        description: "Thank you for purchasing the course",
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, courses }),
          })
          const verifyData = await verifyResponse.json()
          if (verifyData.success) {
            toast.success("Payment Successful!")
            dispatch(resetCart())
            router.push("/dashboard/enrolled-courses")
          } else {
            toast.error("Payment Verification Failed")
          }
        },
      }

      const paymentObject = new (window as any).Razorpay(options)
      paymentObject.open()
      paymentObject.on("payment.failed", (response: any) => {
        toast.error("Oops! Payment Failed.")
        console.error(response.error)
      })

    } catch (error: any) {
      console.error("Payment Error:", error)
      toast.error(error.message || "Could not complete payment")
    } finally {
      toast.dismiss(toastId)
    }
  }

  return (
    <div className="min-w-[280px] rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <p className="mb-1 text-sm font-medium text-richblack-300">Total:</p>
      <p className="mb-6 text-3xl font-medium text-yellow-100">₹ {total}</p>
      <IconBtn
        text="Buy Now"
        onclick={handleBuyCourse}
        customClasses="w-full justify-center"
      />
    </div>
  )
}
