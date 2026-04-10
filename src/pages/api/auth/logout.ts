import type { APIRoute } from 'astro';
import { clearSessionCookies } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  clearSessionCookies(cookies);
  return redirect('/membros/login/');
};
