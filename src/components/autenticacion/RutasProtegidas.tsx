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
  const { pruebas } = useContext(ContextoGeneral);

  useEffect(() => {
    console.log("Verificando token...");
    const controller = new AbortController();

    const verificarToken = async () => {
      setVerificando(true);
      console.log("Verificando token...");
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        logout();
        setVerificando(false);
        return;
      }
      console.log("Token: ", accessToken);

      try {
        console.log("Obteniendo nuevo token en ", pruebas)
        const response = await fetch(`${pruebas}/auth/verify-token`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true"
          },
          signal: controller.signal
        });
        console.log("Response: ", response);
        const data = await response.json();
        if (response.ok && data.token)  {
          Cookies.set("accessToken", data.token, { 
            sameSite: "strict"
          });
          console.log("data: ", data);
          login({
            id: data.usuario.id,
            email: data.usuario.email,
            rol: { id: data.usuario.rol.id, nombre: data.usuario.rol.nombre }
          });
        } else {
          console.log("Token no valido, log out");
          logout(); 
        }
      } catch (error) {
        console.error("Ocurrio un error: ", error);
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
