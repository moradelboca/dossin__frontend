import { Button, FormControlLabel, Switch, TextField } from "@mui/material";
import * as React from "react";
import { ContextoGeneral } from "../Contexto";
import { useContext, useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";

interface Choferes {
    handleClose: any;
    userSeleccionado: any;
    users: any;
    setUsers: any;
    refreshUsers: any;
}

export default function CreadorUser(props: Choferes) {
    const { pruebas } = useContext(ContextoGeneral);
    let { handleClose, userSeleccionado, refreshUsers } = props;
    let [datosNuevoUser, setDatosNuevoUser] = React.useState<any>({
        id: userSeleccionado?.id,
        email: userSeleccionado?.email,
        nombre:
            userSeleccionado?.nombre == "No especificado"
                ? null
                : userSeleccionado?.nombre,
        apellido:
            userSeleccionado?.apellido == "No especificado"
                ? null
                : userSeleccionado?.apellido,
        nombreDeUsuario:
            userSeleccionado?.nombreDeUsuario == "No especificado"
                ? null
                : userSeleccionado?.nombreDeUsuario,
        rolNombre:
            userSeleccionado?.rolNombre == "No especificado"
                ? null
                : userSeleccionado?.rolNombre,
        rolId:
            userSeleccionado?.rolId == "No especificado"
                ? null
                : userSeleccionado?.rolId,
        activo: userSeleccionado?.activo,
    });
    const [activo, setActivo] = React.useState(datosNuevoUser["activo"]);

    const setEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoUser["email"] = e.target.value;
        setDatosNuevoUser({ ...datosNuevoUser });
    };
    const setNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoUser["nombre"] = e.target.value;
        setDatosNuevoUser({ ...datosNuevoUser });
    };
    const setApellido = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoUser["apellido"] = e.target.value;
        setDatosNuevoUser({ ...datosNuevoUser });
    };
    const setNombreDeUsuario = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoUser["nombreDeUsuario"] = e.target.value;
        setDatosNuevoUser({ ...datosNuevoUser });
    };

    const setRol = (value: any) => {
        datosNuevoUser["rolId"] = value.value;
        setDatosNuevoUser({ ...datosNuevoUser });
    };
    const [roles, setRoles] = useState<any[]>([]);

    const [estadoCarga, setEstadoCarga] = useState(true);

    useEffect(() => {
        fetch(`${pruebas}/auth/usuarios/roles`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setRoles(data);
                setEstadoCarga(false);
            })
            .catch(() =>
                console.error("Error al obtener los choferes disponibles")
            );
    }, []);

    const [errorEmail, setErrorEmail] = React.useState(false);

    const handleSave = () => {
        let error = false;
        if (!datosNuevoUser["email"]) {
            setErrorEmail(true);
            error = true;
        }

        if (error) {
            return;
        }
        const metodo = userSeleccionado ? "PUT" : "POST";
        const url = userSeleccionado
            ? `${pruebas}/auth/usuarios/${datosNuevoUser["id"]}`
            : `${pruebas}/auth/usuarios`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosNuevoUser),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        throw new Error(text);
                    });
                }
                return response.json();
            })
            .then(() => {
                refreshUsers();
            })
            .catch((e) => console.error(e));

        handleClose();
    };
    const handleDesactivarUsuario = (activo: any) => {
        datosNuevoUser["activo"] = activo;
        setDatosNuevoUser({ ...datosNuevoUser });
        fetch(`${pruebas}/auth/usuarios/${datosNuevoUser["id"]}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosNuevoUser),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        throw new Error(text);
                    });
                }
                return response.json();
            })
            .then(() => {
                refreshUsers();
            })
            .catch((e) => console.error(e));
    };

    return (
        <>
            <TextField
                margin="dense"
                label="Email"
                type="text"
                fullWidth
                variant="outlined"
                value={(datosNuevoUser && datosNuevoUser["email"]) || ""}
                onChange={setEmail}
                error={errorEmail}
                //disabled={userSeleccionado !== null}
            />

            <TextField
                margin="dense"
                label="Nombre"
                type="text"
                fullWidth
                variant="outlined"
                value={(datosNuevoUser && datosNuevoUser["nombre"]) || ""}
                onChange={setNombre}
            />
            <TextField
                margin="dense"
                label="Apellido"
                type="text"
                fullWidth
                variant="outlined"
                value={(datosNuevoUser && datosNuevoUser["apellido"]) || ""}
                onChange={setApellido}
            />
            <TextField
                margin="dense"
                label="NombreUsuario"
                type="text"
                fullWidth
                variant="outlined"
                value={
                    (datosNuevoUser && datosNuevoUser["nombreDeUsuario"]) || ""
                }
                onChange={setNombreDeUsuario}
            />
            <Autocomplete
                disablePortal
                options={roles.map((rol) => ({
                    label: `${rol.nombre}`,
                    value: rol.id,
                }))}
                onChange={(_e, value: any) => setRol(value)}
                renderInput={(params: any) => (
                    <TextField {...params} label="Rol" />
                )}
                loading={estadoCarga}
                value={datosNuevoUser["rolId"]?.toString()}
            />

            <Button onClick={handleClose} color="primary">
                Cancelar
            </Button>
            <Button onClick={handleSave} color="primary">
                Guardar
            </Button>

            {userSeleccionado && (
                <FormControlLabel
                    control={
                        <Switch
                            checked={activo}
                            onChange={() => {
                                {
                                    setActivo(!activo);
                                    handleDesactivarUsuario(!activo);
                                }
                            }}
                            name="loading"
                            color="primary"
                            defaultValue={activo}
                        />
                    }
                    label={activo ? "Pausar" : "Activar"}
                />
            )}
        </>
    );
}
