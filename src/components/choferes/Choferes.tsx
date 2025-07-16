
import TablaTemplate from "../tablas/TablaTemplate";
import ChoferForm from "../forms/Choferes/ChoferForm";

export default function Choferes() {
  const fields = [
    "cuil",
    "nombre",
    "apellido",
    "numeroCel",
    "urlLINTI",
    "localidad",
    "empresas",
    "rol",
  ];
  const headerNames = [
    "Cuil",
    "Nombre",
    "Apellido",
    "Numero Celular",
    "URL Linti",
    "Localidad",
    "Cuit Empresas",
    "Rol",
  ];


  return (
    <TablaTemplate
      titulo="Colaboradores"
      entidad="colaborador"
      endpoint="colaboradores"
      fields={fields}
      headerNames={headerNames}
      FormularioCreador={ChoferForm} 
      tituloField="apellido"
      subtituloField="cuil"
    />
  );
}

