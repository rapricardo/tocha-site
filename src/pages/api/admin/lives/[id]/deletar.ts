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
  if (!id) return redirect('/admin/lives/?erro=id-ausente');

  const admin = createAdminClient();
  const { error } = await admin.from('events').delete().eq('id', id);

  if (error) {
    console.error('[admin/lives/deletar]', error);
    return redirect(`/admin/lives/${id}/?erro=${encodeURIComponent(error.message)}`);
  }

  return redirect('/admin/lives/?msg=deletada');
};
