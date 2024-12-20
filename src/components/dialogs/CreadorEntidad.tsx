/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

export default function CreadorEntidad({
    seleccionado,
    handleClose,
    datos,
    setDatos,
    nombreEntidad,
    Formulario,
}: {
    seleccionado: any;
    handleClose: any;
    datos: any;
    setDatos: any;
    nombreEntidad: string;
    Formulario: React.ComponentType<any>;
}) {

  return (
    <Dialog open onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{seleccionado ? `Editar ${nombreEntidad}` : `Crear ${nombreEntidad}`}</DialogTitle>
      <DialogContent>
        <Formulario
          seleccionado={seleccionado}
          datos={datos}
          setDatos={setDatos}
          handleClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
