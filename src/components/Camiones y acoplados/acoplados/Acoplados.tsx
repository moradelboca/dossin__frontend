
import TablaTemplate from "../../tablas/TablaTemplate";
import AcopladoForm from "../../forms/acoplados/AcopladoForm";
import MobileCardList from "../../mobile/MobileCardList";
import { useMediaQuery } from "@mui/material";

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

    const isMobile = useMediaQuery("(max-width:768px)");

    return isMobile ? (
        <MobileCardList
            titulo="Acoplados"
            entidad="acoplado"
            endpoint="acoplados"
            fields={fields}
            headerNames={headerNames}
            FormularioCreador={AcopladoForm}
            tituloField="patente"
            subtituloField="tipoAcoplado"
        />
    ) : (
        <TablaTemplate
            titulo="Acoplados"
            entidad="acoplado"
            endpoint="acoplados"
            fields={fields}
            headerNames={headerNames}
            FormularioCreador={AcopladoForm}
        />
    );
}