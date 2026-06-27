import { NextResponse } from 'next/server';

// Auth0 disabled during design iteration — re-enable before launch:
// import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
// export default withMiddlewareAuthRequired();

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/upload', '/flows', '/flows/:id'],
};
