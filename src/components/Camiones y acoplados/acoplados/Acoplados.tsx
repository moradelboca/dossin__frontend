
import TablaTemplate from "../../tablas/TablaTemplate";
import AcopladoForm from "../../forms/acoplados/AcopladoForm";

export default function Acoplados() {
    const fields = [
        "patente",
        "tipoAcoplado",
        "urlRTO",
        "urlPolizaSeguro",
        "urlRuta",
    ];
    const headerNames = [
        "Patente",
        "Tipo Acoplado",
        "URL RTO",
        "URL Póliza de Seguro",
        "URL Ruta",
    ];

    return (
        <TablaTemplate
            titulo="Acoplados"
            entidad="acoplado"
            endpoint="acoplados"
            fields={fields}
            headerNames={headerNames}
            FormularioCreador={AcopladoForm}
            tituloField="patente"
            subtituloField="tipoAcoplado"
        />
    );
}