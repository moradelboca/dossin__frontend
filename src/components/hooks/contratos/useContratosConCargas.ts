import { useEffect, useState } from "react";

const useContratosConCargas = (backendURL: string) => {
    const [contratosConCargas, setContratosConCargas] = useState<any[]>([]);
  
    const fetchContratosConCargas = async () => {
      try {
        const response = await fetch(`${backendURL}/contratos`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        });
        const contratos = await response.json();
  
        const contratosActualizados = await Promise.all(
          contratos.map(async (contrato: any) => {
            if (!contrato.idsCargas?.length) return contrato;
            
            const cargas = await Promise.all(
              contrato.idsCargas.map(async (id: string) => {
                try {
                  const response = await fetch(`${backendURL}/cargas/${id}`);
                  return response.ok ? response.json() : null;
                } catch {
                  return null;
                }
              })
            );
            
            return { 
              ...contrato,
              cargas: cargas.filter(c => c?.id)
            };
          })
        );
  
        // Sort contracts by ID in descending order (highest to lowest)
        const contratosOrdenados = contratosActualizados.sort((a, b) => b.id - a.id);
        setContratosConCargas(contratosOrdenados);
      } catch (error) {
        console.error("Error fetching contratos:", error);
      }
    };
  
    useEffect(() => {
      fetchContratosConCargas();
    }, [backendURL]);
  
    return { contratosConCargas, refreshContratos: fetchContratosConCargas };
  };

export default useContratosConCargas;