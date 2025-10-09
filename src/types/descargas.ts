export interface DescargaRegistro {
  fecha: string;
  grano: string;
  numeroCTG: string;
  kgDescargados: number;
  proveedor: 'Bunge' | 'AGD';
}

export interface ProveedorDescarga {
  id: 'bunge' | 'agd';
  nombre: string;
}

export const PROVEEDORES_DESCARGA: ProveedorDescarga[] = [
  { id: 'bunge', nombre: 'Bunge' },
  { id: 'agd', nombre: 'AGD' },
];



