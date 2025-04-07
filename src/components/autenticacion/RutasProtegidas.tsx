import React, { useContext, useEffect, useState } from "react";
import { useAuth } from "./ContextoAuth";
import { useLocation, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ContextoGeneral } from "../Contexto";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const RutasProtegidas = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { autenticado, user, login, logout } = useAuth();
  const [verificando, setVerificando] = useState(true);
  const location = useLocation();
  const { pruebas } = useContext(ContextoGeneral);

  // Efecto principal de verificación
  useEffect(() => {
    const controller = new AbortController();
    
    const verificarToken = async () => {
      setVerificando(true);
      const accessToken = Cookies.get("accessToken");

      //if (!accessToken) {
      //  logout();
      //  setVerificando(false);
      //  return;
      //}

      try {
        //const response = await fetch(`${pruebas}/auth/verify-token`, {
        //  headers: {
        //    "Authorization": `bearer ${accessToken}`, // Mayúscula en Bearer
        //    "ngrok-skip-browser-warning": "true"
        //  },
        //  signal: controller.signal
        //});

        // const data = await response.json();
        const data = {
          "mensaje": "Token valido",
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJtYXhpcml2YWRlcm8yMDAwQGdtYWlsLmNvbSIsInVzZXJuYW1lIjpudWxsLCJyb2wiOnsiaWQiOjIsIm5vbWJyZSI6IkFkbWluaXN0cmFkb3IifSwiaWF0IjoxNzQyNTc2NzU2LCJleHAiOjE3NDI1ODAzNTZ9.Wcno8vN4H1q8_MCl5Cs_vhSojw_2jC3AfWR2bmF9q6Q",
          "usuario": {
              "id": 2,
              "username": null,
              "email": "maxirivadero2000@gmail.com",
              "imagen": "https://lh3.googleusercontent.com/a/ACg8ocK0l-qfNQvkU5oPCSyE28crQbfY5M_wpUMs1CttsVieLxNeYY9v=s96-c",
              "rol": "Administrador"
          }
      }
        
        //if (response.ok && data.mensaje === "Token valido") {
          if (data.mensaje === "Token valido") {
          console.log("SSSSSSSSSSSSSSSSSSS")
          if (data.token !== accessToken) {
            Cookies.set("accessToken", data.token, { 
              secure: true, 
              sameSite: "strict"
            });
          }
          
          login({
            id: data.usuario.id,
            email: data.usuario.email,
            rol: data.usuario.rol
          });
        } else {
          throw new Error("Token inválido");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error:", error);
          logout();
        }
      } finally {
        if (!controller.signal.aborted) {
          setVerificando(false);
        }
      }
    };

    verificarToken();
    
    return () => controller.abort();
  }, [location.pathname]);

  if (verificando) {
    return <div>Cargando...</div>;
  }

  if (!autenticado) {
    window.open("https://auth.dossin.com.ar/auth/google", "_self");
    return null;
  }
  const rolNombre = user?.rol || (user?.rol as unknown as string);
  console.log(rolNombre)
  if (allowedRoles && !allowedRoles.includes(rolNombre)) {
    console.log("xd")
    return <Navigate to="/no-autorizado" replace />;
  }

  return <>{children}</>;
};

export default RutasProtegidas;