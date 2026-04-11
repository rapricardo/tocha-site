import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ASAAS_WEBHOOK_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Validar token do Asaas
    const token = request.headers.get('asaas-access-token');
    if (!token || token !== env.ASAAS_WEBHOOK_TOKEN) {
      return new Response('Invalid token', { status: 401 });
    }

    const body = await request.text();
    let event: { event: string; payment: Record<string, unknown> };

    try {
      event = JSON.parse(body);
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    // Processar apenas pagamentos confirmados
    if (event.event !== 'PAYMENT_CONFIRMED' && event.event !== 'PAYMENT_RECEIVED') {
      return new Response('Ignored event', { status: 200 });
    }

    const payment = event.payment;
    const externalReference = payment.externalReference as string;

    if (!externalReference || !externalReference.includes('|')) {
      return new Response('Missing or invalid externalReference', { status: 400 });
    }

    const [userId, productSlug] = externalReference.split('|');

    if (!userId || !productSlug) {
      return new Response('Invalid externalReference format', { status: 400 });
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // Registrar pagamento
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        asaas_payment_id: payment.id as string,
        product_slug: productSlug,
        amount: Math.round((payment.value as number) * 100),
        status: 'completed',
      })
      .select('id')
      .single();

    if (paymentError) {
      console.error('Erro ao registrar pagamento:', paymentError);
      // Se for duplicata, ignora (idempotência)
      if (paymentError.code === '23505') {
        return new Response('Already processed', { status: 200 });
      }
      return new Response('Payment insert failed', { status: 500 });
    }

    // Liberar acesso
    const { error: accessError } = await supabase
      .from('user_access')
      .upsert(
        {
          user_id: userId,
          product_slug: productSlug,
          payment_id: paymentRecord.id,
        },
        { onConflict: 'user_id,product_slug' }
      );

    if (accessError) {
      console.error('Erro ao liberar acesso:', accessError);
      return new Response('Access grant failed', { status: 500 });
    }

    return new Response('OK', { status: 200 });
  },
};
