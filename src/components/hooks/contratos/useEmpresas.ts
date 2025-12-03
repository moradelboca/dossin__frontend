import { useEffect, useState } from "react";
import { axiosGet } from "../../../lib/axiosConfig";

const useEmpresas = (backendURL: string) => {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const fetchEmpresas = async () => {
    try {
      setCargando(true);
      const data = await axiosGet<any[]>("empresas", backendURL);
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
