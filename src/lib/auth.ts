import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from './server-utils';
import { authSchema } from './validations';

const config = {
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        // runs on login

        // validation
        const validatedFormData = authSchema.safeParse(credentials);

        if (!validatedFormData.success) {
          return null;
        }

        const { email, password } = validatedFormData.data;

        const user = await getUserByEmail(email);
        if (!user) {
          console.log('No user found');
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!passwordsMatch) {
          console.log('Invalid password');
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    authorized: ({ auth, request }) => {
      const isLoggedIn = Boolean(auth?.user);
      const isTryingToAccessApp = request.nextUrl.pathname.includes('/app');

      if (isTryingToAccessApp && !isLoggedIn) {
        return false;
      }

      if (isTryingToAccessApp && isLoggedIn && !auth?.user.hasAccess) {
        return Response.redirect(new URL('/payment', request.nextUrl));
      }

      if (isTryingToAccessApp && isLoggedIn && auth?.user.hasAccess) {
        return true;
      }

      if (
        isLoggedIn &&
        (request.nextUrl.pathname.includes('/login') ||
          request.nextUrl.pathname.includes('/signup')) &&
        auth?.user.hasAccess
      ) {
        return Response.redirect(new URL('/app/dashboard', request.nextUrl));
      }

      if (!isTryingToAccessApp && isLoggedIn && !auth?.user.hasAccess) {
        if (
          request.nextUrl.pathname.includes('/login') ||
          request.nextUrl.pathname.includes('/signup')
        ) {
          return Response.redirect(new URL('/payment', request.nextUrl));
        }
        return true;
      }

      if (!isTryingToAccessApp && !isLoggedIn) {
        return true;
      }

      return false;
    },
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        token.userId = user.id;
        token.email = user.email!;
        token.hasAccess = user.hasAccess;
      }

      if (trigger === 'update') {
        const userFromDb = await getUserByEmail(token.email);
        if (userFromDb) {
          token.hasAccess = userFromDb.hasAccess;
        }
      }

      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.userId;
      session.user.hasAccess = token.hasAccess;

      return session;
    },
  },
} satisfies NextAuthConfig;

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(config);
