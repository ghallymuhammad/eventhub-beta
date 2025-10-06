import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default withAuth(
  function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.nextauth.token

    // Public routes that don't need authentication
    const publicRoutes = [
      '/',
      '/signin',
      '/signup',
      '/reset-password',
      '/search',
      '/api/events'
    ]

    // Check if the route is public or matches event detail pattern
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) ||
                         pathname.match(/^\/event\/[^/]+$/) // Allow /event/[id] for all users

    // If it's a public route, allow access
    if (isPublicRoute) {
      return NextResponse.next()
    }

    // If not authenticated and trying to access protected route
    if (!token) {
      const signInUrl = new URL('/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Role-based access control
    const userRole = token.role as string

    // Organizer-only routes
    const organizerRoutes = [
      '/organizer',
      '/create-event',
      '/create-event-new'
    ]

    if (organizerRoutes.some(route => pathname.startsWith(route)) && userRole !== 'ORGANIZER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Customer routes (checkout, transactions, etc.)
    const customerRoutes = [
      '/checkout',
      '/transactions',
      '/profile'
    ]

    if (customerRoutes.some(route => pathname.startsWith(route)) && !['CUSTOMER', 'ORGANIZER'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}
