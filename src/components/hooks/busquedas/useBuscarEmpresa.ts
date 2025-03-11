// useBuscarEmpresa.ts
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../../Contexto";

export interface Empresa {
  cuit: string;
  razonSocial: string;
  nombreFantasia: string;
}

interface UseBuscarEmpresaReturn {
  empresa: Empresa | null;
  error: string | null;
}

const useBuscarEmpresa = (value: string | null): UseBuscarEmpresaReturn => {
  const { backendURL } = useContext(ContextoGeneral);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setEmpresa(null);
      return;
    }
    console.log("value HOOK: ", value);

    fetch(`${backendURL}/empresas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((data: Empresa[]) => {
        // Si se pasa un string, se busca la empresa por el string completo (razonSocial - nombreFantasia)
        const encontrada = data.find(
          (emp) => `${emp.nombreFantasia} - ${emp.razonSocial}` === value || emp.cuit === value
        );
        setEmpresa(encontrada || null);
      })
      .catch((err) => {
        console.error("Error al buscar la empresa:", err);
        setError("Error al buscar la empresa");
        setEmpresa(null);
      });
  }, [value, backendURL]);

  console.log("EMPRESA HOOK: ", empresa);

  return { empresa, error };
};

export default useBuscarEmpresa;
