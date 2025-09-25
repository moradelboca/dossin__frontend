import { useEffect, useState } from "react";

const useEmpresas = (backendURL: string) => {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const fetchEmpresas = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${backendURL}/empresas`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      const data = await response.json();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching empresas:", error);
      setEmpresas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, [backendURL]);

  return { empresas, cargando, refreshEmpresas: fetchEmpresas };
};

export default useEmpresas;
