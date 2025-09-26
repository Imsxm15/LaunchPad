'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';

import { useAuth } from '@/context/auth-context';

import { Container } from './container';
import { Button } from './elements/button';
import { Logo } from './logo';

export const Login = () => {
  const router = useRouter();
  const params = useParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locale = useMemo(() => {
    const rawLocale = (params as Record<string, unknown>)?.locale;
    if (Array.isArray(rawLocale)) {
      return rawLocale[0] ?? 'en';
    }
    if (typeof rawLocale === 'string' && rawLocale.length > 0) {
      return rawLocale;
    }
    return 'en';
  }, [params]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    const result = await login(email, password);

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message ?? 'Connexion impossible. Merci de réessayer.');
      return;
    }

    router.push(`/${locale}`);
  };

  return (
    <Container className="min-h-screen max-w-lg mx-auto flex flex-col items-center justify-center py-16">
      <Logo />
      <h1 className="text-xl md:text-4xl font-bold my-4 text-center">
        Bon retour sur LaunchPad
      </h1>

      <form className="w-full my-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Adresse email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-10 pl-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-10 pl-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800"
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <Button
          variant="muted"
          type="submit"
          className="w-full py-3 mt-6"
          disabled={isSubmitting}
        >
          <span className="text-sm">
            {isSubmitting ? 'Connexion en cours…' : 'Se connecter'}
          </span>
        </Button>
      </form>

      <p className="text-sm text-neutral-400">
        Pas encore de compte ?{' '}
        <Link href={`/${locale}/sign-up`} className="text-white underline">
          Créez-en un maintenant
        </Link>
      </p>
    </Container>
  );
};
