import { useContext, useEffect, useState } from "react";
import { ContextoGeneral } from "../Contexto";

export function useUserProfileImage(email?: string, initialImage?: string | null) {
  const { authURL } = useContext(ContextoGeneral);
  const [profileImage, setProfileImage] = useState<string | undefined>(
    initialImage && initialImage.startsWith("http") ? initialImage : undefined
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ((initialImage && initialImage.startsWith("http")) || !email) {
      // Si ya hay imagen válida, o no hay email, no buscar
      setProfileImage(initialImage && initialImage.startsWith("http") ? initialImage : undefined);
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
  }, [email, authURL, initialImage]);

  return { profileImage, loading, error };
} 