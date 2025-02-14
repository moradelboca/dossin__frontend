export const handleSearch = (query: string, datos: any[]): any[] => {
  const lowercasedQuery = query.toLowerCase();
  return datos.filter((item) => {
    const matchesDirectFields = Object.values(item).some((value) =>
      typeof value === "string" && value.toLowerCase().includes(lowercasedQuery)
    );

    const matchesNestedFields = [
      item.localidad?.nombre,
      item.localidad?.provincia?.nombre,
      ...(Array.isArray(item.empresas)
        ? item.empresas.map((empresa: any) => empresa.nombreFantasia)
        : []),
      ...(Array.isArray(item.empresas)
        ? item.empresas.map((empresa: any) => empresa.cuit.toString())
        : []),
      item.rol?.nombre,
    ]
      .filter((nestedValue) => nestedValue)
      .some((nestedValue) => nestedValue.toLowerCase().includes(lowercasedQuery));

    return matchesDirectFields || matchesNestedFields;
  });
};
