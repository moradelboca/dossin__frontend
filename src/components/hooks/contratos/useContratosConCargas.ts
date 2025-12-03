import { useEffect, useState } from "react";
import { axiosGet } from "../../../lib/axiosConfig";

const useContratosConCargas = (backendURL: string) => {
    const [contratosConCargas, setContratosConCargas] = useState<any[]>([]);
  
    const fetchContratosConCargas = async () => {
      try {
        const contratos = await axiosGet<any[]>("contratos", backendURL);
  
        const contratosActualizados = await Promise.all(
          contratos.map(async (contrato: any) => {
            if (!contrato.idsCargas?.length) return contrato;
            
            const cargas = await Promise.all(
              contrato.idsCargas.map(async (id: string) => {
                try {
                  return await axiosGet<any>(`cargas/${id}`, backendURL);
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