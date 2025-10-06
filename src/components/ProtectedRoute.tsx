'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('CUSTOMER' | 'ORGANIZER')[]
  fallbackUrl?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['CUSTOMER', 'ORGANIZER'],
  fallbackUrl = '/signin' 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push(fallbackUrl)
      return
    }

    if (allowedRoles && !allowedRoles.includes(session.user.role as any)) {
      router.push('/unauthorized')
      return
    }
  }, [session, status, router, allowedRoles, fallbackUrl])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || (allowedRoles && !allowedRoles.includes(session.user.role as any))) {
    return null
  }

  return <>{children}</>
}
