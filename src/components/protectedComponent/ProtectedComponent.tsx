import { useAllowed } from "../hooks/auth/useAllowed";

interface ProtectedProps {
  allowedRoles: number[];
  children: JSX.Element;
}

export const ProtectedComponent = ({ allowedRoles, children }: ProtectedProps) => {
  const isAllowed = useAllowed(allowedRoles);
  console.log("isAllowed: \n", isAllowed)
  if (!isAllowed) return null;
  return children;
};
