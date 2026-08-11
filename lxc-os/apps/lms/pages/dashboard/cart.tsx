import DashboardLayout from "../../components/core/Dashboard/DashboardLayout"
import Cart from "../../components/core/Dashboard/Cart"

export default function CartPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto w-11/12 max-w-[1000px] py-10">
        <Cart />
      </div>
    </DashboardLayout>
  )
}
