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
  const { user, login, logout } = useAuth();
  const [verificando, setVerificando] = useState(true);
  const location = useLocation();
  const { authURL, stage } = useContext(ContextoGeneral);

  useEffect(() => {
    const controller = new AbortController();

    const verificarToken = async () => {
      setVerificando(true);
      // Si es desarrollo, loguea un usuario de prueba
      if (stage === "development") {
        console.log("Desarrollo, logueando usuario de prueba");
        login({
          id: 1,
          email: "fabriciosolisw@gmail.com",
          rol: { id: 1, nombre: "admin" }
        })
        setVerificando(false);
        return;
      }
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        logout();
        setVerificando(false);
        return;
      }
      try {
        const response = await fetch(`${authURL}/auth/verify-token`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true"
          },
          signal: controller.signal
        });
        const data = await response.json();
        if (!response.ok || !data.token)  {
          logout();
          setVerificando(false);
          return;
        }
        Cookies.set("accessToken", data.token, { 
          sameSite: "strict"
        });
        login({
          id: data.usuario.id,
          email: data.usuario.email,
          rol: { id: data.usuario.rol.id, nombre: data.usuario.rol.nombre }
        });
        setVerificando(false);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error("Error al verificar el token");
          logout();
        }
      }
      finally {
        setVerificando(false);
      }
    };

    verificarToken();

    return () => {
      controller.abort();
    };
  }, [location.pathname]);

  // Solo redirige cuando no se este verificando y no este autenticado
  /* useEffect(() => {
    if (!verificando && !autenticado) {
      window.open("https://auth.dossin.com.ar/auth/google", "_self");
    }
  }, [verificando, autenticado]); */

  if (verificando) {
    return <div>Cargando...</div>;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol.id)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <>{children}</>;
};

export default RutasProtegidas;