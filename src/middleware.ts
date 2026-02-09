import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  if (isAdminRoute) {
    const role = token?.role as string | undefined
    if (!token || role !== "ADMIN") {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-pathname', request.nextUrl.pathname)
    return NextResponse.next({
      request: { headers: requestHeaders }
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
