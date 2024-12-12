import React, { useEffect } from "react";
import { useAuth } from "./ContextoAuth";

interface ProtectedRouteProps {
    children: React.ReactNode;
}
const RutasProtegidas = ({ children }: ProtectedRouteProps) => {
    const { autenticado, setAutenticado } = useAuth();

    useEffect(() => {
        const cookies = document.cookie.split(";");
        const accessToken = cookies.find((cookie) =>
            cookie.includes("accessToken")
        );
        if (accessToken) {
            setAutenticado(true);
        }
    }, []);
    if (!autenticado) {
        window.location.href = "https://auth.dossin.com.ar" + "/auth/google";
        window.open("https://auth.dossin.com.ar" + "/auth/google", "_self");

        return null;
    }

    return <>{children}</>;
};

export default RutasProtegidas;
