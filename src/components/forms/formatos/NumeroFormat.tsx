import React from "react";
import { PatternFormat } from "react-number-format";
import { CustomProps } from "../../../interfaces/CustomProps";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NumeroFormat = React.forwardRef<any, CustomProps>((props, ref) => {
    const { onChange, ...other } = props;

    return (
        <PatternFormat
            {...other}
            getInputRef={ref}
            format="##########"
            mask="_" // Puedes personalizar la máscara que desees
            onValueChange={(values) => {
                // Verifica si el valor es negativo
                if (Number(values.value) < 0) {
                    return; // No hacer nada si el valor es negativo
                }

                onChange({
                    target: {
                        name: props.name,
                        value: values.value,
                    },
                });
            }}
        />
    );
});

export default NumeroFormat;
