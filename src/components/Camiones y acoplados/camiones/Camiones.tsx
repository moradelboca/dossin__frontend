import TablaTemplate from "../../tablas/TablaTemplate";
import CamionForm from "../../forms/camiones/CamionForm";

export default function Choferes() {
    // Aca definis los fields del json que mandan del back y abajo los nombres de las columnas
    const fields = ["patente", "urlRTO", "urlPolizaSeguro", "urlRuta"];
    const headerNames = [
        "Patente",
        "URL RTO",
        "URL Póliza de Seguro",
        "URL Ruta",
    ];

    return (
        <TablaTemplate
            titulo="Camiones"
            entidad="camion"
            endpoint="camiones"
            fields={fields}
            headerNames={headerNames}
            FormularioCreador={CamionForm}
        />
    );
}