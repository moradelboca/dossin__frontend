/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

interface ValidationRules {
    [key: string]: (value: any) => string | null;
}

interface StepValidation {
    [key: string]: string[];
}

export default function useValidationStepper(initialData: any, rules: ValidationRules, stepValidation: StepValidation) {
    const [data, setData] = useState(initialData);
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

    const validateField = (field: string, value: any) => {
        const rule = rules[field];
        if (rule) {
            const error = rule(value);
            setErrors((prev) => ({ ...prev, [field]: error }));
            return error;
        }
        return null;
    };

    const validateStep = (step: number) => {
        const fieldsToValidate = stepValidation[step];
        let isValid = true;

        fieldsToValidate.forEach((field) => {
            const error = validateField(field, data[field]);
            if (error) {
                isValid = false;
            }
        });

        return isValid;
    };

    const handleChange = (field: string) => (event: any) => {
        const value = event?.target?.value || event; // Soporta inputs o autocompletes
        setData((prev: any) => ({ ...prev, [field]: value }));
        validateField(field, value);
    };

    return { data, errors, handleChange, validateStep };
}

