import { useCallback } from 'react';

const useTransformarCampo = () => {
  const transformarCampo = useCallback((field: string, item: any) => {
    // Resolver campos anidados (e.g., "colaborador.nombre")
    const resolveNestedField = (field: string, obj: any): any => {
      return field.split('.').reduce((acc, key) => acc && acc[key], obj);
    };

    const value = resolveNestedField(field, item);

    if (value && typeof value === "object" &&
        "nombreFantasia" in value && "razonSocial" in value) {
      return `${value.nombreFantasia} - ${value.razonSocial}`;
    }

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
      case "tiposAcoplados":
        if (Array.isArray(value)) {
          return value.map((tipoAcoplado: any) => `${tipoAcoplado.nombre}`).join(", ");
        }
        return "No especificado";
      case "incluyeIVA":
        return value ? "Si" : "No";
      case "cupos":
        return value && Array.isArray(value) ? value.length : "Sin cupos";
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
      case "cargas":
        if (Array.isArray(value)) {
          return value.map((carga: any) => `${carga.id}`).join(", ");
        }
        return "No especificado";
      case "activo":
        return typeof value === "boolean" 
          ? value ? "Activo" : "Inactivo" 
          : "No especificado"
      default:
        return value || "No especificado";
    }
  }, []);

  return transformarCampo;
};

export default useTransformarCampo;
