// useAllowed.ts
import { useAuth } from "../../autenticacion/ContextoAuth";

export const useAllowed = (allowedRoles: string[]): boolean => {
  const { user } = useAuth();
  // Hay usuario a verificar?
  if (!user) return false;
  // Se verifica
  return allowedRoles.includes(user.rol.nombre);
};
