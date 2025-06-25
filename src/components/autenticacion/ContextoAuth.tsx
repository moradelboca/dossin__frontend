// ContextoAuth.tsx
import { createContext, useState, useContext, ReactNode } from "react";
import { ContextoGeneral } from "../Contexto";

interface RolUsuario {
  id: number;
  nombre: string;
}

interface User {
  id: number;
  email: string;
  rol: RolUsuario;
  profileImage?: string; 
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
  const { authURL } = useContext(ContextoGeneral);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    setUser(null);
    try {
      const response = await fetch(`${authURL}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        window.open("https://admin.dossin.com.ar/login", "_self");
      } else {
        console.error("Logout request failed with status:", response.status);
      }
    } catch (error) {
      console.error("Logout request failed, not redirecting.", error);
    }
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
