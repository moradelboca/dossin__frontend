import { useMemo } from "react";

const useSortEmpresasPorRol = (empresas: Array<any> , roles: Array<any>) => {
  return useMemo(() => {
    const sortedArray: any[]= [];
    
    empresas.forEach(empresa => {
      empresa.roles.forEach((rol: { id: any; }) => {
        const roleId = rol.id;
        if (!sortedArray[roleId]) {
          sortedArray[roleId] = [];
        }
        sortedArray[roleId].push(empresa);
      });
    });
    
    return sortedArray;
  }, [empresas, roles]);
};

export default useSortEmpresasPorRol;