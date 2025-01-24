import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJwtToken } from '@/lib/jwt'

export const config = {
  matcher: ['/api/content/:path*', '/api/generate/:path*']
}

export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')

  if (!token) {
    return NextResponse.json(
      { message: 'Authentication token is required' },
      { status: 401 }
    )
  }

  try {
    const decoded = await verifyJwtToken(token, process.env.JWT_SECRET!);
    
    // Clone the headers and create new request with modified headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('user', JSON.stringify(decoded))

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid authentication token' },
      { status: 401 }
    )
  }
}

