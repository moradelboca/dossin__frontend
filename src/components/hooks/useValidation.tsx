/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

interface ValidationRules {
    [key: string]: (value: any) => string | null;
}

export default function useValidation(initialData: any, rules: ValidationRules) {
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

    const validateAll = () => {
        let isValid = true;
        Object.keys(rules).forEach((field) => {
            const error = validateField(field, data[field]);
            if (error) isValid = false;
        });
        return isValid;
    };

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setData((prev: any) => ({ ...prev, [field]: value }));
        validateField(field, value);
    };

    return { data, setData, errors, handleChange, validateAll };
}
