import Cookies from "js-cookie";
import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ContextoGeneral } from "../Contexto";
import { useAuth } from "./ContextoAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
}

const RutasProtegidas = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { autenticado, user, login, logout } = useAuth();
  const [verificando, setVerificando] = useState(true);
  const location = useLocation();
  const { pruebas } = useContext(ContextoGeneral);

  useEffect(() => {
    const controller = new AbortController();

    const verificarToken = async () => {
      setVerificando(true);
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        logout();
        setVerificando(false);
        return;
      }

      try {
        const response = await fetch(`${pruebas}/auth/verify-token`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true"
          },
          signal: controller.signal
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            Cookies.set("accessToken", data.token, { 
              sameSite: "strict"
            });
          } else {
            throw new Error("Token inválido");
          }

          login({
            id: data.usuario.id,
            email: data.usuario.email,
            rol: { id: data.usuario.rol.id, nombre: data.usuario.rol.nombre }
          });
        } else {
          throw new Error("Token inválido");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error", error);
          logout();
        }
      } finally {
        if (!controller.signal.aborted) {
          setVerificando(false);
        }
      }
    };

    verificarToken();

    return () => {
      controller.abort();
    };
  }, [location.pathname]);

  // Solo redirige cuando no se este verificando y no este autenticado
  useEffect(() => {
    if (!verificando && !autenticado) {
      window.open("https://auth.dossin.com.ar/auth/google", "_self");
    }
  }, [verificando, autenticado]);

  if (verificando) {
    return <div>Cargando...</div>;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol.id)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <>{children}</>;
};

export default RutasProtegidas;
