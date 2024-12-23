/* eslint-disable @typescript-eslint/no-explicit-any */
import { Autocomplete, Box, Button, Stack, TextField } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import AutocompletarPais from "../../cargas/autocompletar/AutocompletarPais";
import { ContextoGeneral } from "../../Contexto";
import useValidation from "../../hooks/useValidation";
import CuilFormat from "../formatos/CuilFormat";
import EdadFormat from "../formatos/EdadFormat";
import NumeroFormat from "../formatos/NumeroFormat";

interface ChoferFormProps {
    onSubmit: (data: any) => void; // Acción al guardar
}


const ChoferForm: React.FC<ChoferFormProps & { dataInicial?: any }> = ({ onSubmit, dataInicial = {} }) => {
    const { backendURL } = useContext(ContextoGeneral);
    const [empresasTransportistas, setEmpresasTransportistas] = useState<any[]>(
        []
    );
    const [estadoCarga, setEstadoCarga] = useState(true);
    
    useEffect(() => {
        fetch(`${backendURL}/empresastransportistas`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setEmpresasTransportistas(data);
                setEstadoCarga(false);
            })
            .catch(() =>
                console.error("Error al obtener los choferes disponibles")
            );
    }, []);

    // Definimos las condiciones para que este correcto el formulario y condiciones de error
    const { data, errors, handleChange, validateAll } = useValidation(
        {
            cuil: "",
            numeroCel: "",
            nombre: "",
            apellido: "",
            edad: "",
            cuitEmpresa: "",
            urlLINTI: "",
            localidad: "",
            ...dataInicial,
        },
        {
            cuil: (value) => (!value ? "El CUIL es obligatorio" : null),
            numeroCel: (value) => !value ? "El número de celular es obligatorio" : null,
            nombre: (value) => (!value ? "El nombre es obligatorio" : null),
            apellido: (value) => (!value ? "El apellido es obligatorio" : null),
            edad: (value) => !value || isNaN(+value) || +value <= 0
                    ? "Debe ingresar una edad válida"
                    : null,
            cuitEmpresa: (value) => !value ? "El CUIT de la empresa es obligatorio" : null,
            urlLINTI: (value) => !value ? "El url LINTI es obligatorio" : null,
            localidad: (value) => !value ? "La localidad es obligatoria" : null,
        }
    );

    useEffect(() => {
        setData((prev) => ({ ...prev, ...dataInicial })); // Sincroniza con datos iniciales
    }, [dataInicial]);

    const handleSubmit = () => {
        if (validateAll()) {
            onSubmit(data);
        }
    };

    return (
        <>
            <Stack direction="row" spacing={2}>
                <TextField
                    margin="dense"
                    label="Cuil"
                    variant="outlined"
                    fullWidth
                    slotProps={{
                        input: { inputComponent: CuilFormat as any },
                    }}
                    value={data.cuil}
                    onChange={handleChange("cuil")}
                    error={!!errors.cuil}
                    helperText={errors.cuil}
                />
            </Stack>

            <Box
                display="flex"
                flexDirection="row"
                gap={2}
                alignContent={"center"}
                alignItems={"center"}
                marginTop={2}
                marginBottom={1}
            >
                <Box width="100px">
                    <AutocompletarPais 
                        setCodigoSeleccionado={(value: any) => handleChange("codigoPais")(value)} 
                        error={errors.codigoPais}
                    />
                </Box>
                <TextField
                    label="Número"
                    fullWidth
                    variant="outlined"
                    slotProps={{
                        input: { inputComponent: NumeroFormat as any },
                    }}
                    value={data.numeroCel}
                    onChange={handleChange("numeroCel")}
                    error={!!errors.numeroCel}
                    helperText={errors.numeroCel}
                />
            </Box>

            <Box
                display="flex"
                flexDirection="row"
                gap={2}
                alignContent={"center"}
                alignItems={"center"}
                marginTop={2}
                marginBottom={1}
            >
                <TextField
                    label="Nombre"
                    fullWidth
                    variant="outlined"
                    value={data.nombre}
                    onChange={handleChange("nombre")}
                    error={!!errors.nombre}
                    helperText={errors.nombre}
                />
                <TextField
                    label="Apellido"
                    fullWidth
                    variant="outlined"
                    value={data.apellido}
                    onChange={handleChange("apellido")}
                    error={!!errors.apellido}
                    helperText={errors.apellido}
                />
            </Box>

            <TextField
                label="Edad"
                fullWidth
                variant="outlined"
                slotProps={{
                    input: { inputComponent: EdadFormat as any },
                }}
                value={data.edad}
                onChange={handleChange("edad")}
                error={!!errors.edad}
                helperText={errors.edad}
            />

            <Autocomplete
                options={empresasTransportistas.map((empresa) => ({
                    label: `${empresa.nombreFantasia} - ${empresa.cuit}`,
                    value: empresa.cuit,
                }))}
                onChange={(_, value) =>
                    handleChange("cuitEmpresa")(value?.value || "")
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Cuit empresa"
                        error={!!errors.cuitEmpresa}
                        helperText={errors.cuitEmpresa}
                    />
                )}
                loading={estadoCarga}
            />

            <TextField
                margin="dense"
                label="URL Linti"
                type="text"
                fullWidth
                variant="outlined"
                value={data.urlLINTI}
                onChange={handleChange("urlLINTI")}
            />

            <TextField
                margin="dense"
                label="Localidad"
                type="text"
                fullWidth
                variant="outlined"
                value={data.localidad}
                onChange={handleChange("localidad")}
            />

            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                style={{ marginTop: "20px" }}
            >
                Guardar
            </Button>
        </>
    );
};

export default ChoferForm;