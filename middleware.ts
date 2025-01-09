import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
    '/sign-up',
    '/sign-in',
    '/home',
    '/'
])

const isPublicAPIRoute = createRouteMatcher([
    '/api/videos'
])

export default clerkMiddleware(async (auth, req) => {
    const {userId} = await auth()  // if the user is logged in then only userId will be available
    const currentURL = new URL(req.url)
    const isAccessingHome = currentURL.pathname === '/home'
    const isAPIRequest = currentURL.pathname.startsWith('/api')
 
    if(userId && isPublicRoute(req) && !isAccessingHome){  // user is logged in and is trying to access a public route but not the home page this means that the user is trying to access the login or signup page & we don't want that because the user is already logged in
        return NextResponse.redirect(new URL('/home', req.url))  // check hitesh sir code for redirecting to home page
    }

    if(!userId){
        if(!isPublicRoute(req) && !isPublicAPIRoute(req)){  // if the user is not logged in and is trying to access a private route then redirect the user to the login page
            return NextResponse.redirect(new URL('/sign-in', req.url))
        }

        if(isAPIRequest && !isPublicAPIRoute(req)){  // if the user is not logged in and is trying to access a private API route then redirect the user to the login page
            return NextResponse.redirect(new URL('/sign-in', req.url))
        }
    }
    
    return NextResponse.next()  // if the user is logged in and is trying to access a public or protected route then let the user access the route
})

export const config = {
  matcher: [
    // Middware always run for all pages that start with '/' (i.e '/login', 'home', etc)
    '/((?!.*\\..*|_next).*)',
    // Middleware runs for the '/' route
    '/',
    // middleware always run for all API routes
    '/(api|trpc)(.*)',
  ],
}