import { useAllowed } from "../hooks/auth/useAllowed";

interface ProtectedProps {
  allowedRoles: number[];
  children: JSX.Element;
}

export const ProtectedComponent = ({ allowedRoles, children }: ProtectedProps) => {
  const isAllowed = useAllowed(allowedRoles);
  if (!isAllowed) return null;
  return children;
};
