import NextAuth from "next-auth"
import { authOptions } from "../../../lib/auth-options"

export { authOptions }
export default NextAuth(authOptions)
