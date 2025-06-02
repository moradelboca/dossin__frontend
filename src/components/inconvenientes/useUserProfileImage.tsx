import { useContext, useEffect, useState } from "react";
import { ContextoGeneral } from "../Contexto";

export function useUserProfileImage(email?: string) {
  const { authURL } = useContext(ContextoGeneral);
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      setProfileImage(undefined);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${authURL}/auth/usuarios/email/${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.imagen && data.imagen.startsWith("http")) {
          setProfileImage(data.imagen);
        } else {
          setProfileImage(undefined);
        }
      })
      .catch(() => {
        setError("No se pudo obtener la imagen de perfil");
        setProfileImage(undefined);
      })
      .finally(() => setLoading(false));
  }, [email, authURL]);

  return { profileImage, loading, error };
} 