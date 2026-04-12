import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  full_name?: string | null;
  guest: boolean;
};

type LoginPayload = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (payload: LoginPayload) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return window.sessionStorage.getItem("access_token");
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = window.sessionStorage.getItem("auth_user");
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      window.sessionStorage.removeItem("auth_user");
      return null;
    }
  });

  const isAuthenticated = !!token;

  const login = useCallback((payload: LoginPayload) => {
    window.sessionStorage.setItem("access_token", payload.token);
    window.sessionStorage.setItem("auth_user", JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  }, []);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem("access_token");
    window.sessionStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, token, user, login, logout }),
    [isAuthenticated, token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
