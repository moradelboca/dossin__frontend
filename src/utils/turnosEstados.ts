export const getNextEstadoId = (estadoNombre: string) => {
  // Normalizar el nombre del estado: trim y lowercase
  const estadoNormalizado = estadoNombre?.trim().toLowerCase() || '';
  
  switch (estadoNormalizado) {
    case 'con errores':
      return 2; // Creado (o 3 si va a validado)
    case 'creado':
      return 3; // Validado
    case 'validado':
      return 5; // Autorizado
    case 'autorizado':
      return 6; // Tarado
    case 'tarado':
      return 7; // Cargado
    case 'cargado':
      return 8; // En viaje
    case 'en viaje':
      return 9; // Descargado
    case 'descargado':
      return 10; // Facturado
    case 'facturado':
      return 11; // Pagado
    default:
      return null;
  }
};
