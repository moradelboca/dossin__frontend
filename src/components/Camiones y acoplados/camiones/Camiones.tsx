import TablaTemplate from "../../tablas/TablaTemplate";
import CamionForm from "../../forms/camiones/CamionForm";
import MobileCardList from "../../mobile/MobileCardList";
import { useMediaQuery } from "@mui/material";

export default function Choferes() {
    // Aca definis los fields del json que mandan del back y abajo los nombres de las columnas
    const fields = ["patente", "urlRTO", "urlPolizaSeguro", "urlRuta"];
    const headerNames = [
        "Patente",
        "URL RTO",
        "URL Póliza de Seguro",
        "URL Ruta",
    ];

    const isMobile = useMediaQuery("(max-width:768px)");

    return isMobile ? (
        <MobileCardList
            titulo="Camiones"
            entidad="camion"
            endpoint="camiones"
            fields={fields}
            headerNames={headerNames}
            FormularioCreador={CamionForm}
            tituloField="patente"
            subtituloField=""
        />
    ) : (
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