// ContextoAuth.tsx
import { createContext, useState, useContext, ReactNode } from "react";
import Cookies from "js-cookie";

interface User {
  id: number;
  email: string;
  rol: string;
}

interface AuthContextProps {
  autenticado: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [autenticado, setAutenticado] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setAutenticado(true);
    setUser(userData);
  };

  const logout = () => {
    setAutenticado(false);
    setUser(null);
    Cookies.remove("accessToken");
  };

  return (
    <AuthContext.Provider value={{ autenticado, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};