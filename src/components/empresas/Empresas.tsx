import TablaTemplate from "../tablas/TablaTemplate";
import EmpresaForm from "../forms/empresas/EmpresaForm";

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


    return (
        <TablaTemplate
        titulo="Empresas"
        entidad="empresa"
        endpoint="empresas"
        fields={fields}
        headerNames={headerNames}
        FormularioCreador={EmpresaForm}
        tituloField="razonSocial"
        subtituloField="cuit"
        />
    );
}
