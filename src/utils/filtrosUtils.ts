
export const applyOperator = (operator: unknown, variable: string, value: string): boolean => {
  switch (operator) {
    case "contains":
      return variable.includes(value);
    case "does not contain":
      return !variable.includes(value);
    case "equals":
      return variable === value;
    case "does not equal":
      return variable !== value;
    case "starts with":
      return variable.startsWith(value);
    case "ends with":
      return variable.endsWith(value);
    default:
      return true;
  }
};

export interface Filter {
  column: string;
  operator: string;
  value: string;
}

export const handleFilterApply = (filter: Filter, datos: any[]) => {
  const { column, operator, value } = filter;
  return datos.filter((item) => {
    const fieldValue = item[column];

    if (typeof fieldValue === "object") {
      if (Array.isArray(fieldValue)) {
        if (column === "empresas") {
          return fieldValue.some((empresa: any) =>
            applyOperator(operator, empresa.nombreFantasia, value)
          );
        } else {
          return fieldValue.some((nestedValue) =>
            applyOperator(operator, nestedValue.nombre || nestedValue.toString(), value)
          );
        }
      } else if (fieldValue.nombre) {
        return applyOperator(operator, fieldValue.nombre, value);
      }
      return false;
    }
    return applyOperator(operator, fieldValue, value);
  });
};

  