import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CardActions } from "@mui/material";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import Color from "color"; // v3.2.1
import { CustomButtom } from "../../botones/CustomButtom";
import { useEffect, useState } from "react";
import CreadorTurno from "../creadores/CreadorTurno";

const defaultColor = "#d9d9d9"; // Gris claro

const StyledRoot = styled("div")<{ color?: string }>(() => ({
    position: "relative",
    borderRadius: "1rem",
    minWidth: 256,
    paddingTop: 0,
    "&:before": {
        transition: "0.2s",
        position: "absolute",
        width: "100%",
        height: "100%",
        content: '""',
        display: "block",
        borderRadius: "1rem",
        zIndex: 0,
        bottom: 0,
    },
    transition: "0.2s",
    "&:hover": {
        transform: "scale(1.1)",
    },
}));

const StyledContent = styled("div")<{ color?: string; gradientColor?: string }>(
    ({ gradientColor = defaultColor }) => ({
        position: "relative",
        maxWidth: 270,
        zIndex: 1,
        padding: "1rem 1.5rem 1.5rem",
        borderRadius: "1rem",
        boxShadow: `0 6px 16px 0 ${Color("#000000").fade(0.5)}`,
        "&:before": {
            content: '""',
            display: "block",
            position: "absolute",
            left: 0,
            top: 1,
            zIndex: 0,
            width: "100%",
            height: "100%",
            borderRadius: "1rem",
            background: `linear-gradient(160deg, #D9D9D9 55%, ${gradientColor} 100%)`,
        },
    })
);

const AvatarLogo = styled(Avatar)(() => ({
    transition: "0.3s",
    width: 56, // Mantiene el tamaño
    height: 56,
    backgroundColor: "rgba(0, 0, 0, 0.08)", // Fondo
    borderRadius: "4rem",
}));

const TypographyTitle = styled(Typography)(() => ({
    fontFamily: "Arial",
    fontSize: "1rem",
    color: "#163660",
    textTransform: "uppercase",
}));

const TypographySubtitle = styled(Typography)(() => ({
    fontFamily: "Arial",
    color: "#163660",
    opacity: 0.87,
    fontWeight: 500,
    fontSize: 14,
}));

const AvatarBox = styled(Box)(() => ({
    display: "flex",
    alignItems: "center",
}));

const ContentBox = styled(Box)(() => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
}));

const NameBox = styled(Box)(() => ({
    display: "flex",
    flexDirection: "column",
}));

const DividerBox = styled(Box)(() => ({
    marginTop: "1rem",
}));

interface TarjetaProps {
    titleNombre?: string;
    titleApellido?: string;
    textCuil?: string;
    imagen?: string;
    textCelular?: string;
    textCuitEmpresa?: string;
    textPatenteCamion?: string;
    textPatenteSemi1?: string;
    textPatenteSemi2?: string;
    idCarga: any;
    fecha: any;
    refreshCupos: any;
    idTurno: any;
    idEstado: any;
}

export function TarjetaChoferesCarga(props: TarjetaProps) {
    const [openDialog, setOpenDialog] = useState(false);
    const [seleccionado, setSeleccionado] = useState(false);
    const [estadoTurno, setEstadoTurno] = useState("");

    const {
        titleNombre,
        titleApellido,
        textCuil,
        textCelular,
        textCuitEmpresa,
        textPatenteCamion,
        textPatenteSemi1,
        textPatenteSemi2,
        imagen,
        idCarga,
        fecha,
        refreshCupos,
        idTurno,
        idEstado,
    } = props;

    const handleClickConfirmar = () => {
        setSeleccionado(true);
        setOpenDialog(true);
        refreshCupos();
    };
    function handleCloseDialog() {
        setOpenDialog(false);
    }
    useEffect(() => {
        ActualizarTurno();
    }, [idEstado]);

    function ActualizarTurno() {
        if (idEstado === 1) {
            setEstadoTurno("ConErrores");
        }
        if (idEstado === 2) {
            setEstadoTurno("Pendiente");
        } else if (idEstado === 3) {
            setEstadoTurno("Aceptado");
        } else if (idEstado === 4) {
            setEstadoTurno("Rechazado");
        }
    }

    return (
        <Box width="300px">
            <StyledRoot>
                <StyledContent
                    gradientColor={
                        estadoTurno === "Confirmado"
                            ? "#76D766"
                            : estadoTurno === "Rechazado"
                              ? "#FF0000"
                              : estadoTurno === "ConErrores"
                                ? "#FFA07A"
                                : estadoTurno === "Pendiente"
                                  ? "#fafa8c"
                                  : "#A5A5A5"
                    }
                >
                    <Box position={"relative"} zIndex={1}>
                        <ContentBox>
                            <NameBox>
                                <TypographyTitle variant={"h1"}>
                                    {titleNombre}
                                </TypographyTitle>
                                <TypographyTitle variant={"h2"}>
                                    {titleApellido}
                                </TypographyTitle>
                            </NameBox>
                            <AvatarBox>
                                <AvatarLogo src={imagen} />
                            </AvatarBox>
                        </ContentBox>
                        <DividerBox>
                            <Divider sx={{ my: 1, bgcolor: "#163660" }} />
                        </DividerBox>
                        <TypographySubtitle>
                            Cuil: {textCuil}
                        </TypographySubtitle>
                        <TypographySubtitle>
                            Celular: {textCelular}
                        </TypographySubtitle>
                        <TypographySubtitle>
                            Cuit Empresa: {textCuitEmpresa}
                        </TypographySubtitle>
                        <TypographySubtitle>
                            Patente Camion: {textPatenteCamion}
                        </TypographySubtitle>
                        <TypographySubtitle>
                            Patente Semi 1: {textPatenteSemi1}
                        </TypographySubtitle>
                        <TypographySubtitle>
                            Patente Semi 2: {textPatenteSemi2}
                        </TypographySubtitle>
                        <CardActions>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-evenly",
                                    width: "100%",
                                }}
                            >
                                {/* Botón "Contactar" */}
                                <CustomButtom
                                    title="Contactar"
                                    onClick={() =>
                                        window.open(
                                            `https://wa.me/${textCelular}`,
                                            "_blank"
                                        )
                                    }
                                />
                                {/* Botón "Confirmar", solo si no está confirmado */}
                                {estadoTurno !== "confirmado" && (
                                    <>
                                        <CustomButtom
                                            onClick={handleClickConfirmar}
                                            title="Verificar"
                                        />
                                        <CreadorTurno
                                            idCarga={idCarga}
                                            fecha={fecha}
                                            refreshCupos={refreshCupos}
                                            handleCloseDialog={
                                                handleCloseDialog
                                            }
                                            openDialog={openDialog}
                                            turno={props}
                                            seleccionado={seleccionado}
                                            idTurno={idTurno}
                                            actualizarTurno={ActualizarTurno}
                                        />
                                    </>
                                )}
                            </Box>
                        </CardActions>
                    </Box>
                </StyledContent>
            </StyledRoot>
        </Box>
    );
}
