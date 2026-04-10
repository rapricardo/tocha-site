import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { getSession } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = await getSession(cookies);
  if (!session) {
    return redirect('/membros/login/');
  }

  const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

  const origin = new URL(request.url).origin;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: session.user.email,
    line_items: [
      {
        price: import.meta.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${origin}/membros/?compra=sucesso`,
    cancel_url: `${origin}/video-ia/oferta/`,
    metadata: {
      supabase_user_id: session.user.id,
    },
  });

  if (!checkoutSession.url) {
    return redirect('/membros/?erro=checkout');
  }

  return redirect(checkoutSession.url);
};
