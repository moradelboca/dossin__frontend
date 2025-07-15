export const ESTADO_PERMISOS = [
  { id: 1, nombre: "Con errores", roles: [1, 4] },
  { id: 2, nombre: "Creado", roles: [1] },
  { id: 3, nombre: "Validado", roles: [1, 4] },
  { id: 4, nombre: "Cancelado", roles: [1] },
  { id: 5, nombre: "Autorizado", roles: [1, 2, 3] },
  { id: 6, nombre: "Tarado", roles: [1, 2, 3] },
  { id: 7, nombre: "Cargado", roles: [1, 2] },
  { id: 8, nombre: "En viaje", roles: [1, 2] },
  { id: 9, nombre: "Descargado", roles: [1, 2] },
  { id: 10, nombre: "Facturado", roles: [1, 2] },
  { id: 11, nombre: "Pagado", roles: [1, 2] }
];

export function puedeVerEstado(estadoId: number, rolId: number): boolean {
  // Logística (rolId: 4) puede ver todos los estados
  if (rolId === 4) {
    return true;
  }
  
  const permiso = ESTADO_PERMISOS.find(e => e.id === estadoId);
  return permiso ? permiso.roles.includes(rolId) : false;
}

export function puedeEditarEstado(estadoId: number, rolId: number): boolean {
  const permiso = ESTADO_PERMISOS.find(e => e.id === estadoId);
  return permiso ? permiso.roles.includes(rolId) : false;
} 