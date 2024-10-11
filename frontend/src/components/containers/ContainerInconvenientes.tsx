import { Box, Grid2 } from "@mui/material";
import { TarjetaChoferesInconveniente } from "../tarjetas/CardGradientRojo";
import { choferes } from "../tarjetas/listachoferes";

export default function ContainerInconvenientes() {
    return (
        <Box margin={5}>
            <Grid2 container spacing={3}>
                {choferes.map((chofer, index) => (
                    <TarjetaChoferesInconveniente
                        key={index}
                        titleNombre={chofer.titleNombre}
                        titleApellido={chofer.titleApellido}
                        textCuil={chofer.textCuil}
                        imagen={chofer.imagen}
                        textCelular={chofer.textCelular}
                        textCuitEmpresa={chofer.textCuitEmpresa}
                        textInconveniente={chofer.textInconveniente}
                    />
                ))}
            </Grid2>
        </Box>
    );
}
