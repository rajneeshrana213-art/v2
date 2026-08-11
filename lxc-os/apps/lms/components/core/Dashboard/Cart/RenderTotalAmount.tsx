import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"

import { BuyCourse } from "../../../../services/operations/studentFeaturesAPI"
import IconBtn from "../../../Common/IconBtn"
import { RootState } from "../../../../lib/state/reducer"

export default function RenderTotalAmount() {
  const { total, cart } = useSelector((state: RootState) => state.cart)
  const { token } = useSelector((state: RootState) => state.auth)
  const { user } = useSelector((state: RootState) => state.profile)
  const router = useRouter()
  const dispatch = useDispatch()

  const handleBuyCourse = () => {
    const courses = cart.map((course: any) => course._id)
    if (token && user) {
        // Note: BuyCourse should be updated to handle Next.js router if needed, 
        // but for now we pass the router and it might need adaptation in the service.
        BuyCourse(token, courses, user, router, dispatch)
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
