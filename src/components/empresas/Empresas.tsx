import TablaTemplate from "../tablas/TablaTemplate";
import EmpresaForm from "../forms/empresas/EmpresaForm";
import MobileCardList from "../mobile/MobileCardList";
import { useMediaQuery } from "@mui/material";

export default function Empresas() {
    const fields = [
        "cuit",
        "razonSocial",
        "nombreFantasia",
        "localidad",
        "numeroCel",
        "roles",
        "urlConstanciaAfip",
        "urlConstanciaCBU",
        "email",
    ];
    const headerNames = [
        "Cuit",
        "Razón Social",
        "Nombre Fantasía",
        "Localidad/Provincia",
        "Número Celular",
        "Roles",
        "URL Constancia Afip",
        "URL Constancia CBU",
        "Email",
    ];

    const isMobile = useMediaQuery("(max-width:768px)");

    return isMobile ? (
        <MobileCardList
            titulo="Empresas"
            entidad="empresa"
            endpoint="empresas"
            fields={fields}
            headerNames={headerNames}
            FormularioCreador={EmpresaForm}
            tituloField="razonSocial"
            subtituloField="cuit"
        />
    ) : (
        <TablaTemplate
            titulo="Empresas"
            entidad="empresa"
            endpoint="empresas"
            fields={fields}
            headerNames={headerNames}
            FormularioCreador={EmpresaForm}
        />
    );
}
