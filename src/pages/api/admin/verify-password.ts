// src/pages/api/admin/verify-password.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { password } = await request.json();
    const adminPassword = import.meta.env.PUBLIC_ADMIN_PASSWORD;

    if (password === adminPassword) {
      // Set a secure cookie with the same name as the middleware
      cookies.set('admin-auth', password, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};