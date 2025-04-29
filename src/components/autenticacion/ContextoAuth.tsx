// ContextoAuth.tsx
import { createContext, useState, useContext, ReactNode } from "react";
import Cookies from "js-cookie";

interface RolUsuario {
  id: number;
  nombre: string;
}

interface User {
  id: number;
  email: string;
  rol: RolUsuario;
}

interface AuthContextProps {
  //autenticado: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("accessToken");
    window.open("https://auth.dossin.com.ar/auth/google", "_self");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
