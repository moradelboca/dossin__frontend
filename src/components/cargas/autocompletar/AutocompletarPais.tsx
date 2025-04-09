/* eslint-disable @typescript-eslint/no-explicit-any */
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useMediaQuery } from "@mui/material";

interface Telefono {
    setCodigoSeleccionado: (value: string) => void;
    error: boolean;
    defaultPhone?: string;
    fullWidth?: boolean;
}

export default function AutocompletarPais(props: Telefono) {
    const { setCodigoSeleccionado, error, defaultPhone, fullWidth } = props;
    const isMobile = useMediaQuery("768px");
    
    const defaultCountry = countries.find(country => country.phone === defaultPhone) || null;

    const handleChange = (_event: any, value: any) => {
        if (value) {
            setCodigoSeleccionado(value.phone);
        } else {
            setCodigoSeleccionado("");
        }
    };

    return (
        <Autocomplete
            id="country-select-demo"
            options={countries}
            autoHighlight
            sx={{ 
                width: fullWidth ? "100%" : "120px",
                minWidth: "120px" 
            }}
            getOptionLabel={(option) => option.phone}
            value={defaultCountry}
            componentsProps={{ 
                popper: { 
                    style: { 
                        width: isMobile ? "100%" : "300px",
                        minWidth: "300px" 
                    } 
                } 
            }}
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                    <Box
                        key={key}
                        component="li"
                        sx={{ 
                            "& > img": { 
                                mr: 2, 
                                flexShrink: 0 
                            },
                            fontSize: isMobile ? "0.875rem" : "1rem"
                        }}
                        {...optionProps}
                    >
                        <img
                            loading="lazy"
                            width="20"
                            srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                            src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                            alt=""
                        />
                        {option.label} ({option.code}) {option.phone}
                    </Box>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={{ 
                        width: fullWidth ? "100%" : "120px",
                        "& .MuiInputBase-root": {
                            height: isMobile ? "56px" : "auto"
                        }
                    }}
                    label="Característica"
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: "new-password",
                        style: {
                            fontSize: isMobile ? "0.875rem" : "1rem"
                        }
                    }}
                    error={error}
                    helperText={error ? "Seleccione código" : ""} 
                    FormHelperTextProps={{
                        sx: {
                            mx: 0,
                            whiteSpace: "nowrap"
                        }
                    }}
                />
            )}
            onChange={handleChange}
        />
    );
}

interface CountryType {
    code: string;
    label: string;
    phone: string;
    suggested?: boolean;
}

// Lista de países con prefijos telefónicos
const countries: readonly CountryType[] = [
    { code: "AR", label: "Argentina", phone: "+549" },
    { code: "BO", label: "Bolivia", phone: "+591" },
    { code: "BR", label: "Brazil", phone: "+55" },
    { code: "CL", label: "Chile", phone: "+56" },
    { code: "CO", label: "Colombia", phone: "+57" },
    { code: "CR", label: "Costa Rica", phone: "+506" },
    { code: "CU", label: "Cuba", phone: "+53" },
    { code: "EC", label: "Ecuador", phone: "+593" },
    { code: "GT", label: "Guatemala", phone: "+502" },
    { code: "HN", label: "Honduras", phone: "+504" },
    { code: "JM", label: "Jamaica", phone: "+1876" },
    { code: "MX", label: "Mexico", phone: "+52" },
    { code: "NI", label: "Nicaragua", phone: "+505" },
    { code: "PA", label: "Panama", phone: "+507" },
    { code: "PY", label: "Paraguay", phone: "+595" },
    { code: "PE", label: "Peru", phone: "+51" },
    { code: "SV", label: "El Salvador", phone: "+503" },
    { code: "UY", label: "Uruguay", phone: "+598" },
    { code: "VE", label: "Venezuela", phone: "+58" },
];
