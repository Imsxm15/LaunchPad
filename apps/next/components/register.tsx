'use client';

import {
  IconBrandGithubFilled,
  IconBrandGoogleFilled,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';

import { useAuth } from '@/context/auth-context';

import { Container } from './container';
import { Button } from './elements/button';
import { Logo } from './logo';

export const Register = () => {
  const router = useRouter();
  const params = useParams();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const result = await register({
      email,
      password,
      first_name: firstName.trim() || undefined,
      last_name: lastName.trim() || undefined,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message ?? "L'inscription a échoué. Réessayez plus tard.");
      return;
    }

    setSuccess(true);
    router.push(`/${locale}`);
  };

  return (
    <Container className="min-h-screen max-w-lg mx-auto flex flex-col items-center justify-center py-16">
      <Logo />
      <h1 className="text-xl md:text-4xl font-bold my-4 text-center">
        Créez votre compte LaunchPad
      </h1>

      <form className="w-full my-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Prénom (optionnel)"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className="h-10 pl-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800"
          />
          <input
            type="text"
            placeholder="Nom (optionnel)"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className="h-10 pl-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800"
          />
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
            minLength={6}
            className="h-10 pl-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800"
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        {success && !error && (
          <p className="mt-4 text-sm text-emerald-400" role="status">
            Votre compte est prêt ! Redirection en cours...
          </p>
        )}

        <Button
          variant="muted"
          type="submit"
          className="w-full py-3 mt-6"
          disabled={isSubmitting}
        >
          <span className="text-sm">
            {isSubmitting ? 'Création du compte…' : 'Créer un compte'}
          </span>
        </Button>
      </form>

      <Divider />

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button
          type="button"
          className="flex flex-1 justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset]"
          disabled
        >
          <IconBrandGithubFilled className="h-4 w-4 text-black" />
          <span className="text-sm">GitHub (bientôt disponible)</span>
        </button>
        <button
          type="button"
          className="flex flex-1 justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset]"
          disabled
        >
          <IconBrandGoogleFilled className="h-4 w-4 text-black" />
          <span className="text-sm">Google (bientôt disponible)</span>
        </button>
      </div>
    </Container>
  );
};

const Divider = () => {
  return (
    <div className="relative w-full py-8">
      <div className="w-full h-px bg-neutral-700 rounded-tr-xl rounded-tl-xl" />
      <div className="w-full h-px bg-neutral-800 rounded-br-xl rounded-bl-xl" />
      <div className="absolute inset-0 h-5 w-5 m-auto rounded-md px-3 py-0.5 text-xs bg-neutral-800 shadow-[0px_-1px_0px_0px_var(--neutral-700)] flex items-center justify-center">
        OR
      </div>
    </div>
  );
};
