import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { toast } from "react-hot-toast"

interface CartState {
  cart: any[];
  total: number;
  totalItems: number;
}

const getSafeLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  return null;
};

const initialState: CartState = {
  cart: getSafeLocalStorage("cart") || [],
  total: getSafeLocalStorage("total") || 0,
  totalItems: getSafeLocalStorage("totalItems") || 0,
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<any>) => {
      const course = action.payload
      const index = state.cart.findIndex((item) => item._id === course._id)

      if (index >= 0) {
        toast.error("Course already in cart")
        return
      }
      state.cart.push(course)
      state.totalItems++
      state.total += course.price
      
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(state.cart))
        localStorage.setItem("total", JSON.stringify(state.total))
        localStorage.setItem("totalItems", JSON.stringify(state.totalItems))
      }
      toast.success("Course added to cart")
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const courseId = action.payload
      const index = state.cart.findIndex((item) => item._id === courseId)

      if (index >= 0) {
        state.totalItems--
        state.total -= state.cart[index].price
        state.cart.splice(index, 1)
        
        if (typeof window !== "undefined") {
          localStorage.setItem("cart", JSON.stringify(state.cart))
          localStorage.setItem("total", JSON.stringify(state.total))
          localStorage.setItem("totalItems", JSON.stringify(state.totalItems))
        }
        toast.success("Course removed from cart")
      }
    },
    resetCart: (state) => {
      state.cart = []
      state.total = 0
      state.totalItems = 0
      
      if (typeof window !== "undefined") {
        localStorage.removeItem("cart")
        localStorage.removeItem("total")
        localStorage.removeItem("totalItems")
      }
    },
  },
})

export const { addToCart, removeFromCart, resetCart } = cartSlice.actions
export default cartSlice.reducer
