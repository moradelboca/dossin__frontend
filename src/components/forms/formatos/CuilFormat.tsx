import React from "react";
import { PatternFormat } from "react-number-format";
import { CustomProps } from "../../../interfaces/CustomProps";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CuilFormat = React.forwardRef<any, CustomProps>((props, ref) => {
    const { onChange, ...other } = props;

    return (
        <PatternFormat
            {...other}
            getInputRef={ref}
            format="##-########-#"
            mask="-"
            onValueChange={(values) => {
                if (Number(values.value) < 0) {
                    return; 
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

export default CuilFormat;
