import TablaTemplate from "../tablas/TablaTemplate";
import CreadorUser from "./CreadorUser";

export default function Usuarios() {

    const fields = [
        "id",
        "email",
        "nombre",
        "apellido",
        "nombreDeUsuario",
        "imagen",
        "rolNombre",
        "activo",
    ];
    const headerNames = [
        "Id",
        "Email",
        "Nombre",
        "Apellido",
        "Nombre de usuario",
        "Imagen",
        "Rol",
        "Activo",
    ];

    return (
        <TablaTemplate
            titulo="Usuarios"
            entidad="usuario"
            endpoint="auth/usuarios"
            fields={fields}
            headerNames={headerNames}
            FormularioCreador={CreadorUser}
            usarPruebas={true}
        />
    );
}