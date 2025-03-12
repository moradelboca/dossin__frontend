// RutasProtegidas.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "./ContextoAuth";
import { useLocation, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const RutasProtegidas = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { autenticado, user, login, logout } = useAuth();
  const [verificando, setVerificando] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verificarToken = async () => {
      setVerificando(true);
      const accessToken = Cookies.get("accessToken");
      
      try {
        if (accessToken) {
          const decoded: any = jwtDecode(accessToken);
          const userData = {
            id: decoded.id,
            email: decoded.email,
            rol: decoded.rol
          };
          login(userData);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Error decodificando token:", error);
        logout();
      } finally {
        setVerificando(false);
      }
    };

    verificarToken();
  }, [location.pathname]);

  if (verificando) {
    return <div>Cargando...</div>;
  }

  if (!autenticado) {
    window.open("https://auth.dossin.com.ar/auth/google", "_self");
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user?.rol?.nombre ?? "")) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <>{children}</>;
};

export default RutasProtegidas;