import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { ErrorOutline } from "@mui/icons-material";
import { ViewInAr } from "@mui/icons-material";
import { GridView } from "@mui/icons-material";
import {
    GroupsOutlined,
    AddLocationAltOutlined,
    DomainAddOutlined,
    LocalShippingOutlined,
} from "@mui/icons-material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Link } from "react-router-dom";
import { ListItemButton } from "@mui/material";
import ThunderstormOutlinedIcon from "@mui/icons-material/ThunderstormOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";

const CustomMuiDrawer = styled(MuiDrawer)<{
    ancho?: number;
    transicion: string;
}>(({ ancho, transicion }) => ({
    width: ancho,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    transition: transicion,
    "& .MuiDrawer-paper": {
        width: ancho,
        transition: transicion,
        overflowX: "hidden",
    },
}));

interface NavsideProps {
    navAbierto: boolean;
    handleClickToggleNav: () => void;
    anchoAbierto: number;
    anchoCerrado: number;
    transicion: string;
}

export default function Navside(navSideProps: NavsideProps) {
    const {
        navAbierto,
        handleClickToggleNav,
        anchoAbierto,
        anchoCerrado,
        transicion,
    } = navSideProps;

    const listasDeNavegacion = [
        ["Home"],
        [
            "Cargas",
            "Choferes",
            "Ubicaciones",
            "Empresas",
            "Camiones",
            "Inconvenientes",
            "Clima",
            "Calculadora",
        ],
    ];
    const listasDeIconos = [
        [<GridView />],
        [
            <ViewInAr />,
            <GroupsOutlined />,
            <AddLocationAltOutlined />,
            <DomainAddOutlined />,
            <LocalShippingOutlined />,
            <ErrorOutline />,
            <ThunderstormOutlinedIcon />,
            <CalculateOutlinedIcon />,
        ],
    ];
    const listasDeRutas = [
        ["/"],
        [
            "/cargas",
            "/choferes",
            "/ubicaciones",
            "/empresas",
            "/camiones",
            "/inconvenientes",
            "/clima",
            "/calculadora",
        ],
    ];

    return (
        <CustomMuiDrawer
            variant="permanent"
            ancho={navAbierto ? anchoAbierto : anchoCerrado}
            transicion={transicion}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: navAbierto ? "flex-end" : "center",
                    height: "70px",
                    alignItems: "center",
                    width: "100%",
                    background: navAbierto ? "#163660" : "#D9D9D9",
                }}
            >
                <IconButton
                    onClick={handleClickToggleNav}
                    sx={{
                        height: "fit-content",
                        color: navAbierto ? "#fff" : "#163660",
                    }}
                >
                    {navAbierto ? <ChevronLeftIcon /> : <MenuIcon />}
                </IconButton>
            </Box>
            <Box sx={{ background: "#163660", height: "100%" }}>
                {listasDeNavegacion.map((list, indexList) => (
                    <Box key={indexList} sx={{ color: "#fff" }}>
                        <Divider
                            sx={{
                                backgroundColor: "#fff",
                                opacity: 0.3,
                            }}
                        />
                        <List>
                            {list.map((text, indexText) => (
                                <ListItem
                                    key={text}
                                    sx={{
                                        margin: "5px 10px 5px 10px",
                                        padding: "0px",
                                        height: "35px",
                                        width: navAbierto
                                            ? "auto"
                                            : "fit-content",
                                        "&:active": { color: "#fff" },
                                        "& .MuiTouchRipple-root span": {
                                            color: "#fff",
                                        },
                                    }}
                                    component={Link}
                                    to={listasDeRutas[indexList][indexText]}
                                >
                                    <ListItemButton
                                        sx={{
                                            padding: navAbierto
                                                ? "0px 5px"
                                                : "5px",
                                            borderRadius: "10px",
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                color: "#fff",
                                                minWidth: "unset",
                                            }}
                                        >
                                            {
                                                listasDeIconos[indexList][
                                                    indexText
                                                ]
                                            }
                                        </ListItemIcon>
                                        {navAbierto ? (
                                            <ListItemText
                                                primary={text}
                                                sx={{
                                                    marginLeft: "10px",
                                                    color: "#fff",
                                                }}
                                            />
                                        ) : null}
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                ))}
            </Box>
        </CustomMuiDrawer>
    );
}
