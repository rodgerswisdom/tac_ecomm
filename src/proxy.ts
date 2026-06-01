import NextAuth from "next-auth"
import { authConfig } from "./lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role

  if (isAdminRoute) {
    if (!isLoggedIn || role !== "ADMIN") {
      const signInUrl = new URL('/auth/signin', req.nextUrl.origin)
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
      return Response.redirect(signInUrl)
    }

    // Set headers for server components
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-pathname', req.nextUrl.pathname)

    // We continue to the next middleware or route
    return
  }
})

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
