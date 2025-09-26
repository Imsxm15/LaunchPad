'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type MedusaCustomer = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
};

type AuthResult = {
  success: boolean;
  message?: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
};

type AuthContextValue = {
  customer: MedusaCustomer | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (payload: RegisterPayload) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function parseJsonResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<MedusaCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        setCustomer(null);
        return;
      }

      const data = await parseJsonResponse(response);
      if (data && typeof data === 'object' && 'customer' in data) {
        setCustomer((data as { customer?: MedusaCustomer | null }).customer ?? null);
      } else {
        setCustomer(null);
      }
    } catch (error) {
      console.error('Failed to refresh Medusa session', error);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await parseJsonResponse(response);

        if (!response.ok) {
          const message =
            (data as { message?: string } | null)?.message ??
            'Impossible de se connecter. Vérifiez vos identifiants.';
          return { success: false, message };
        }

        if (data && typeof data === 'object' && 'customer' in data) {
          setCustomer((data as { customer?: MedusaCustomer | null }).customer ?? null);
        } else {
          await refresh();
        }

        return { success: true };
      } catch (error) {
        console.error('Failed to login with Medusa', error);
        return {
          success: false,
          message: "Une erreur s'est produite pendant la connexion.",
        };
      }
    },
    [refresh]
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<AuthResult> => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await parseJsonResponse(response);

        if (!response.ok) {
          const message =
            (data as { message?: string } | null)?.message ??
            "Impossible de créer le compte. Veuillez vérifier les informations fournies.";
          return { success: false, message };
        }

        if (data && typeof data === 'object' && 'customer' in data) {
          setCustomer((data as { customer?: MedusaCustomer | null }).customer ?? null);
        } else {
          await refresh();
        }

        return { success: true };
      } catch (error) {
        console.error('Failed to register with Medusa', error);
        return {
          success: false,
          message: "Une erreur s'est produite pendant l'inscription.",
        };
      }
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn('Medusa logout returned a non-ok response');
      }
    } catch (error) {
      console.error('Failed to logout from Medusa', error);
    } finally {
      setCustomer(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      customer,
      isLoading,
      login,
      register,
      logout,
      refresh,
    }),
    [customer, isLoading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
