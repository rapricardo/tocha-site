import { defineMiddleware } from 'astro:middleware';
import { getSession, getUserProfile } from './lib/auth';

const PUBLIC_MEMBER_ROUTES = [
  '/membros/login',
  '/membros/cadastro',
  '/membros/recuperar-senha',
];

const PAID_ROUTES_PREFIX = '/membros/maquina';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith('/membros')) {
    return next();
  }

  const isPublicMemberRoute = PUBLIC_MEMBER_ROUTES.some(
    (route) => pathname === route || pathname === route + '/'
  );
  if (isPublicMemberRoute) {
    return next();
  }

  const session = await getSession(context.cookies);
  if (!session) {
    return context.redirect('/membros/login/');
  }

  context.locals.session = session;

  if (pathname.startsWith(PAID_ROUTES_PREFIX)) {
    const profile = await getUserProfile(session.user.id);
    if (!profile?.paid) {
      return context.redirect('/membros/?acesso=bloqueado');
    }
    context.locals.profile = profile;
  }

  return next();
});
