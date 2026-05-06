import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/alunos/:path*',
    '/cursos/:path*',
    '/tipos-curso/:path*',
    '/matriculas/:path*',
    '/api/alunos/:path*',
    '/api/cursos/:path*',
    '/api/tipos-curso/:path*',
    '/api/matriculas/:path*',
    '/api/dashboard/:path*',
  ],
};
