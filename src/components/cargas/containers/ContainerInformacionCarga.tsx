import { Box, Typography } from "@mui/material";
import { useContext } from "react";
import { ContextoCargas } from "./ContainerTajetasCargas";
import ContainerInfoCard from "../../cards/cargas/ContainerInfoCard";
import ContainerTipoAcoplado from "./ContainerTipoAcoplado";

// Importar tus íconos SVG o componentes para representar los íconos
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PublicIcon from "@mui/icons-material/Public";
import GroupIcon from "@mui/icons-material/Group";

export default function ContainerInformacionCarga() {
    const { cupos, cargaSeleccionada, handleClickAbrirDialog } =
        useContext(ContextoCargas);
    const cuposLength = cupos.length;

    return (
        <>
            <Typography>Datos</Typography>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 1,
                    width: "100%",
                    height: "100%",
                }}
            >
                {/* Tarifa */}
                <ContainerInfoCard
                    title="Tarifa"
                    value={`$${cargaSeleccionada?.tarifa || "-"} / ${cargaSeleccionada?.tipoTarifa?.nombre || "-"}`}
                    icon={<MonetizationOnIcon />}
                    onEdit={() => handleClickAbrirDialog(2)}
                    isEditable={!!cargaSeleccionada}
                />

                {/* Kilómetros */}
                <ContainerInfoCard
                    title="Kilómetros"
                    value={cargaSeleccionada?.cantidadKm || 0}
                    icon={<PublicIcon />}
                    onEdit={() => handleClickAbrirDialog(1)}
                    isEditable={!!cargaSeleccionada}
                />

                {/* Cupos creados */}
                <ContainerInfoCard
                    title="Cupos creados"
                    value={cuposLength}
                    icon={<GroupIcon />}
                    onEdit={() => console.log("Navegar a cupos")}
                    isEditable={!!cargaSeleccionada}
                />

                {/* Tipo de acoplado */}
                    <ContainerTipoAcoplado />
            </Box>
        </>
    );
}
