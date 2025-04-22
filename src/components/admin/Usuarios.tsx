import UsuariosForm from "../forms/usuarios/UsuariosForm";
import TablaTemplate from "../tablas/TablaTemplate";

export default function Usuarios() {

    const fields = [
        "id",
        "email",
        "nombre",
        "apellido",
        "nombreDeUsuario",
        "imagen",
        "rol",
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
            FormularioCreador={UsuariosForm}
            usarAuthURL={true}
            tituloField="email"
            subtituloField="apellido"
        />
    );
}