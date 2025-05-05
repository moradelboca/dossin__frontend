
import TablaTemplate from "../tablas/TablaTemplate";
import ContratoForm from "../forms/contratos/ContratoForm";

export default function Choferes() {
  const fields = [
    "id",
    "titularCartaDePorte",
    "cargas",
    "remitenteProductor",
    "remitenteVentaPrimaria",
    "remitenteVentaSecundaria",
    "corredorVentaPrimaria",
    "corredorVentaSecundaria",
    "representanteEntregador",
    "destinatario",
    "destino",
    "intermediarioDeFlete",
    "fletePagador",
  ];
  const headerNames = [
    "ID",
    "Titular CP",
    "Cargas",
    "Remitente Productor",
    "Remitente Venta Primaria",
    "Remitente Venta Secundaria",
    "Corredor Venta Primaria",
    "Corredor Venta Secundaria",
    "Representante Entregador",
    "Representante Recibidor",
    "Destinatario",
    "Destino",
    "Intermediario De Flete",
    "Flete Pagador",
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
    renderFullScreen={true} // Activa el modo pantalla completa para el 
    />
  );
}

