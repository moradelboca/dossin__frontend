
import TablaTemplate from "../tablas/TablaTemplate";
import ContratoForm from "../forms/contratos/ContratoForm";

export default function Choferes() {
  const fields = [
    "titularCartaDePorte",
    "destino",
    "remitente",
    "plantaProcedenciaRuca",
    "destinoRuca",
    "cargas",
  ];
  const headerNames = [
    "Titular CP",
    "Destino",
    "Remitente",
    "Procedencia Ruca",
    "Destino Ruca",
    "Cargas",
  ];

  return (
    <TablaTemplate
    titulo="Contratos"
    entidad="Contrato"
    endpoint="Contratos"
    fields={fields}
    headerNames={headerNames}
    FormularioCreador={ContratoForm} 
    tituloField="titularCartaDePorte"
    subtituloField="destino"
      renderFullScreen={true} // Activa el modo pantalla completa
    />
  );
}

