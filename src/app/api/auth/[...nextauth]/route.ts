import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const { handlers, auth } = NextAuth(authOptions)

export const GET = handlers.GET
export const POST = handlers.POST
export { auth }
