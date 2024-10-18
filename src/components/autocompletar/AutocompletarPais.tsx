import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

export default function AutocompletarPa() {
    return (
        <Autocomplete
            id="country-select-demo"
            options={countries}
            autoHighlight
            sx={{ width: "120px" }}
            getOptionLabel={(option) => option.phone} // Cambiado para mostrar el código telefónico
            componentsProps={{ popper: { style: { width: "300px" } } }}
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                    <Box
                        key={key}
                        component="li"
                        sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                        {...optionProps}
                    >
                        <img
                            loading="lazy"
                            width="20"
                            srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                            src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                            alt=""
                        />
                        {option.label} ({option.code}) {option.phone}{" "}
                    </Box>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={{ width: "120px" }}
                    label="Característica"
                    slotProps={{
                        htmlInput: {
                            ...params.inputProps,
                            autoComplete: "new-password", // deshabilitar autocompletar y autocompletar
                        },
                    }}
                />
            )}
        />
    );
}
interface CountryType {
    code: string;
    label: string;
    phone: string;
    suggested?: boolean;
}
// From https://bitbucket.org/atlassian/atlaskit-mk-2/raw/4ad0e56649c3e6c973e226b7efaeb28cb240ccb0/packages/core/select/src/data/countries.js
const countries: readonly CountryType[] = [
    { code: "AR", label: "Argentina", phone: "+54 9" },
    { code: "BO", label: "Bolivia", phone: "+591" },
    { code: "BR", label: "Brazil", phone: "+55" },
    { code: "CL", label: "Chile", phone: "+56" },
    { code: "CO", label: "Colombia", phone: "+57" },
    { code: "CR", label: "Costa Rica", phone: "+506" },
    { code: "CU", label: "Cuba", phone: "+53" },
    { code: "DO", label: "Dominican Republic", phone: "+1-809" },
    { code: "EC", label: "Ecuador", phone: "+593" },
    { code: "GT", label: "Guatemala", phone: "+502" },
    { code: "HN", label: "Honduras", phone: "+504" },
    { code: "JM", label: "Jamaica", phone: "+1-876" },
    { code: "MX", label: "Mexico", phone: "+52" },
    { code: "NI", label: "Nicaragua", phone: "+505" },
    { code: "PA", label: "Panama", phone: "+507" },
    { code: "PY", label: "Paraguay", phone: "+595" },
    { code: "PE", label: "Peru", phone: "+51" },
    { code: "SV", label: "El Salvador", phone: "+503" },
    { code: "UY", label: "Uruguay", phone: "+598" },
    { code: "VE", label: "Venezuela", phone: "+58" },
];
