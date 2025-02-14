import { useCallback } from 'react';

const useTransformarCampo = () => {
  const transformarCampo = useCallback((field: string, item: any) => {
    // Resolver campos anidados (e.g., "colaborador.nombre")
    const resolveNestedField = (field: string, obj: any): any => {
      return field.split('.').reduce((acc, key) => acc && acc[key], obj);
    };

    const value = resolveNestedField(field, item);

    switch (field) {
      case "localidad":
        return value
          ? `${value.nombre} / ${value.provincia?.nombre || "Sin provincia"}`
          : "No especificado";
      case "empresas":
        return Array.isArray(value)
          ? value
              .map((empresa: any) => `${empresa.nombreFantasia} - ${empresa.cuit}`)
              .join(", ")
          : "No especificado";
      case "roles":
        if (Array.isArray(value)) {
          return value.map((rol: any) => `${rol.nombre}`).join(", ");
        }
        return "No especificado";
      case "rol":
        return value ? `${value.nombre}` : "Sin rol";
      case "numeroCel":
        if (value) {
          const numero = value.toString();
          if (numero.length >= 10) {
            const codigo = numero.slice(0, numero.length - 10);
            const celular = numero.slice(-10);
            return `+${codigo}-${celular}`;
          }
        }
        return value || "No especificado";
      default:
        return value || "No especificado";
    }
  }, []);

  return transformarCampo;
};

export default useTransformarCampo;
