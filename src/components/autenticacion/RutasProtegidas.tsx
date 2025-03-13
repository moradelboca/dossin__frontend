import React, { useContext, useEffect, useState } from "react";
import { useAuth } from "./ContextoAuth";
import { useLocation, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { ContextoGeneral } from "../Contexto";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

interface BackendTokenPayload {
  id: number;
  email: string;
  rol: {
    id: number;
    nombre: string;
  };
  exp: number;
}

const RutasProtegidas = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { autenticado, user, login, logout } = useAuth();
  const [verificando, setVerificando] = useState(true);
  const location = useLocation();
  const { pruebas } = useContext(ContextoGeneral);

  useEffect(() => {
    const verificarToken = async () => {
      setVerificando(true);
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        logout();
        setVerificando(false);
        return;
      }

      try {
        // Intentamos decodificar el token para determinar su tipo
        const decoded: Partial<BackendTokenPayload> = jwtDecode(accessToken);
        const ahora = Date.now() / 1000;

        // Verificar si es un token del backend y aún válido
        if (decoded.id && decoded.email && decoded.rol && decoded.exp && decoded.exp > ahora) {
          login({
            id: decoded.id,
            email: decoded.email,
            rol: decoded.rol,
          });
        } else {
          // Si no es válido o es un token de Google, verificamos con el backend
          const response = await fetch(`${pruebas}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: accessToken }),
          });

          if (!response.ok) throw new Error("Error en la verificación del token");

          const data = await response.json();
          if (!data.accessToken) throw new Error("Token no recibido");

          // Actualizamos el token en cookies
          Cookies.set("accessToken", data.accessToken);

          // Decodificamos el nuevo token del backend
          const nuevoTokenDecodificado: BackendTokenPayload = jwtDecode(data.accessToken);
          login({
            id: nuevoTokenDecodificado.id,
            email: nuevoTokenDecodificado.email,
            rol: nuevoTokenDecodificado.rol,
          });
        }
      } catch (error) {
        console.error("Error en autenticación:", error);
        logout();
        window.open("https://auth.dossin.com.ar/auth/google", "_self");
      } finally {
        setVerificando(false);
      }
    };

    verificarToken();
  }, [location.pathname, login, logout, pruebas]);

  if (verificando) {
    return <div>Cargando...</div>;
  }

  if (!autenticado) {
    return null; // Redirección ya manejada en el catch
  }

  if (allowedRoles && !allowedRoles.includes(user?.rol?.nombre ?? "")) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <>{children}</>;
};

export default RutasProtegidas;