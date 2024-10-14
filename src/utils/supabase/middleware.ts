import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers
      }
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // 요청의 모든 쿠키를 가져오는 함수
            return request.cookies.getAll(); // 쿠키 목록 반환
          },
          setAll(cookiesToSet) {
            // 설정할 쿠키 목록을 받아 설정하는 함수
            cookiesToSet.forEach(
              ({ name, value }) => request.cookies.set(name, value) // 요청의 쿠키에 설정
            );
            response = NextResponse.next({
              request
            });
            cookiesToSet.forEach(
              ({ name, value, options }) => response.cookies.set(name, value, options) // 응답의 쿠키에도 설정
            );
          }
        }
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();
    // protected routes
    const protectedRoutes = ['/mypage', '/community/write'];
    const isProtectedRoute = protectedRoutes.includes(request.nextUrl.pathname);

    if (isProtectedRoute && user.error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};
