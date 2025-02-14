
import TablaTemplate from "../tablas/TablaTemplate";
import MobileCardList from "../mobile/MobileCardList";
import { useMediaQuery } from "@mui/material";
import ChoferForm from "../forms/Choferes/ChoferForm";

export default function Choferes() {
  const fields = [
    "cuil",
    "nombre",
    "numeroCel",
    "apellido",
    "urlLINTI",
    "localidad",
    "empresas",
    "rol",
  ];
  const headerNames = [
    "Cuil",
    "Nombre",
    "Numero Celular",
    "Apellido",
    "URL Linti",
    "Localidad",
    "Cuit Empresas",
    "Rol",
  ];

  const isMobile = useMediaQuery("(max-width:768px)");

  return isMobile ? (
    <MobileCardList
      titulo="Colaboradores"
      entidad="colaborador"
      endpoint="colaboradores"
      fields={fields}
      headerNames={headerNames}
      FormularioCreador={ChoferForm} 
      tituloField="apellido"
      subtituloField="cuil"
    />
  ) : (
    <TablaTemplate
      titulo="Colaboradores"
      entidad="colaborador"
      endpoint="colaboradores"
      fields={fields}
      headerNames={headerNames}
      FormularioCreador={ChoferForm}
    />
  );
}

