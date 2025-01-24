import { Box, IconButton, Typography } from "@mui/material";
import BorderColorIcon from "@mui/icons-material/BorderColor";

interface ContainerInfoCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    onEdit: () => void;
    isEditable: boolean;
}

export default function ContainerInfoCard({
    title,
    value,
    icon,
    onEdit,
    isEditable,
}: ContainerInfoCardProps) {
    return (
        <Box
            sx={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "0.5rem",
                paddingBottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-start",
                height: "100%",
                backgroundColor: "#ffffff",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color:"#90979F" }}>
                    {icon}
                </Box>
                <IconButton disabled={!isEditable} onClick={onEdit}>
                    <BorderColorIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>
            
            <Box >
                <Typography variant="subtitle1" fontWeight="bold" 
                sx={{
                    color: "#90979F",
                    fontSize: 12,
                    marginBottom:"-0.5rem",                                   
                }}>
                    {title}
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        color: "#333",
                        fontWeight:600,
                    }}
                >
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}
