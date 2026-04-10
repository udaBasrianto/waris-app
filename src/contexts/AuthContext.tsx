import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, setToken, removeToken } from "@/lib/api";

type AppRole = "admin" | "ustad" | "klien";

interface UserData {
  id: string;
  email: string;
  role: AppRole;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: UserData | null;
  profile: { full_name: string | null; phone: string | null; avatar_url: string | null } | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  signOut: () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await api.get<{ user: UserData }>("/auth/me");
      setUser(data.user);
    } catch {
      // Token invalid or expired
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signOut = () => {
    removeToken();
    setUser(null);
  };

  const profile = user
    ? { full_name: user.full_name, phone: user.phone, avatar_url: user.avatar_url }
    : null;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      role: user?.role || null,
      loading,
      signOut,
      refreshUser: fetchUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
