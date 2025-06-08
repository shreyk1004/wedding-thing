import { NextResponse, NextRequest } from 'next/server';

// Helper function to get user from middleware header
function getUserFromMiddleware(request: NextRequest) {
  const userHeader = request.headers.get('x-user-id');
  if (!userHeader) return null;
  
  return { id: userHeader };
}

export async function GET(request: NextRequest) {
  const user = getUserFromMiddleware(request);
  
  return NextResponse.json({
    user: user ? {
      id: user.id
    } : null,
    message: user ? 'User authenticated via middleware' : 'No user found'
  });
} 