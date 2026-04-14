import type { APIRoute } from 'astro';
import { getSession, getUserProfile } from '../../../../../lib/auth';
import { createAdminClient } from '../../../../../lib/supabase-admin';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect, params }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/membros/login/');
  const profile = await getUserProfile(session.user.id);
  if (profile?.role !== 'admin') return redirect('/membros/?acesso=negado');

  const { id } = params;
  if (!id) return redirect('/admin/usuarios/?erro=id-ausente');

  const form = await request.formData();
  const productSlug = form.get('product_slug')?.toString().trim();
  const cohortIdRaw = form.get('cohort_id')?.toString().trim();

  if (!productSlug) {
    return redirect(`/admin/usuarios/${id}/?erro=produto-obrigatorio`);
  }

  const admin = createAdminClient();
  const { error } = await admin.from('user_access').upsert(
    {
      user_id: id,
      product_slug: productSlug,
      cohort_id: cohortIdRaw || null,
    },
    { onConflict: 'user_id,product_slug' }
  );

  if (error) {
    console.error('[admin/usuarios/grant]', error);
    return redirect(`/admin/usuarios/${id}/?erro=${encodeURIComponent(error.message)}`);
  }

  return redirect(`/admin/usuarios/${id}/?msg=acesso-concedido`);
};
