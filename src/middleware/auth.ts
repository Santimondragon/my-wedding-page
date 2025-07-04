import type { AstroGlobal } from 'astro';

const AUTH_COOKIE = 'admin-auth';

export async function checkAuth(Astro: AstroGlobal) {
  const ADMIN_PASSWORD = import.meta.env.PUBLIC_ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    throw new Error('PUBLIC_ADMIN_PASSWORD environment variable is not set');
  }

  const authCookie = Astro.cookies.get(AUTH_COOKIE)?.value;

  console.log('Auth check:', {
    hasCookie: !!authCookie,
    cookieValue: authCookie
  });

  if (!authCookie || authCookie !== ADMIN_PASSWORD) {
    console.log('Auth check: Invalid or missing auth cookie');
    return {
      isAuthorized: false
    };
  }

  console.log('Auth check: Success');
  return {
    isAuthorized: true
  };
}