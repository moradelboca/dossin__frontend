import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "./Contexto";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

interface props {
    datosNuevaCarga: any;
}

export default function SelectorTarifa(selectorProps: props) {
    let { datosNuevaCarga } = selectorProps;
    const { backendURL } = useContext(ContextoGeneral);
    const [tarifas, setTarifas] = useState<any[]>([]);
    let unidadesStrings: string[];

    useEffect(() => {
        fetch(`${backendURL}/tipotarifas`)
            .then((response) => response.json())
            .then((tarifas) => setTarifas(tarifas))
            .catch(() =>
                console.error("Error al obtener las Tarifas disponibles")
            );
    }, [backendURL]);

    unidadesStrings = tarifas.map((tarifa) => {
        return `${tarifa.nombre}`;
    });

    let unidadesIds = tarifas.map((tarifa) => {
        return tarifa.id;
    });

    const seleccionarId = (e: any, value: string | null) => {
        const index = unidadesStrings.indexOf(value || "");
        if (index !== -1) {
            datosNuevaCarga["idTipoTarifa"] = unidadesIds[index];
        }
    };
    const seleccionarTarifa = (e: any) => {
        datosNuevaCarga["tarifa"] = parseInt(e.target.value);
    };

    return (
        <Box display="flex" flexDirection="column">
            <Box
                display="flex"
                flexDirection="row"
                gap={2}
                alignContent={"center"}
                alignItems={"center"}
                width={"800px"}
            >
                <Box display="column" gap={2}>
                    <Box>
                        <TextField
                            id="outlined-basic"
                            label="Tarifa"
                            variant="outlined"
                            type="number" // Solo permite números
                            inputProps={{
                                inputMode: "numeric", // Teclado numérico en móviles
                                pattern: "[0-9]*", // Acepta solo dígitos
                            }}
                            onChange={seleccionarTarifa} // Actualizar el valor de la tarifa
                        />
                    </Box>
                </Box>
                <>X</>
                <Box display="column" gap={2}>
                    <Autocomplete
                        disablePortal
                        options={unidadesStrings}
                        sx={{ width: 300 }}
                        onChange={(e, value) => seleccionarId(e, value)} // Actualizar el ID de la unidad seleccionada
                        renderInput={(params) => (
                            <TextField {...params} label={"Unidades"} />
                        )}
                    />
                </Box>
            </Box>
            <FormControlLabel
                control={
                    <Checkbox
                        onChange={(e) => {
                            datosNuevaCarga["incluyeIVA"] = e.target.checked; // Asigna true o false dependiendo del estado del Checkbox
                        }}
                        sx={{
                            color: "#163660", // Color por defecto
                            "&.Mui-checked": {
                                color: "#163660", // Color cuando está seleccionado
                            },
                        }}
                    />
                }
                label="Incluye IVA?"
            />
        </Box>
    );
}
