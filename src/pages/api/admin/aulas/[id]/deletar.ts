import type { APIRoute } from 'astro';
import { getSession, getUserProfile } from '../../../../../lib/auth';
import { createAdminClient } from '../../../../../lib/supabase-admin';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect, params }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/membros/login/');
  const profile = await getUserProfile(session.user.id);
  if (profile?.role !== 'admin') return redirect('/membros/?acesso=negado');

  const { id } = params;
  if (!id) return redirect('/admin/aulas/?erro=id-ausente');

  const admin = createAdminClient();
  const { error } = await admin.from('lessons').delete().eq('id', id);

  if (error) {
    console.error('[admin/aulas/deletar]', error);
    return redirect(`/admin/aulas/${id}/?erro=${encodeURIComponent(error.message)}`);
  }

  return redirect('/admin/aulas/?msg=deletada');
};
