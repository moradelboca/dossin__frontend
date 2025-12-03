/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { axiosPost, axiosPut } from "../../lib/axiosConfig";

export const useSaveHandler = (
    fields: string[], 
    backendURL: string, 
    endpoint: string, 
    setDatos: (data: any[]) => void
) => {
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const handleSave = (datos: any, seleccionado: any, handleClose: () => void) => {
        let error = false;
        const newErrors: Record<string, boolean> = {};

        // Validar campos requeridos
        fields.forEach((field) => {
            if (!datos[field]) {
                newErrors[field] = true;
                error = true;
            }
        });

        setErrors(newErrors);

        if (error) {
            return;
        }

        const isUpdate = !!seleccionado;
        const url = isUpdate
            ? `${endpoint}/${datos[fields[0]]}` // Assume el primer field como ID único
            : endpoint;

        const requestPromise = isUpdate
            ? axiosPut<any>(url, datos, backendURL)
            : axiosPost<any>(url, datos, backendURL);

        requestPromise
            .then((data) => {
                if (!isUpdate) {
                    setDatos([...datos, data]); // Usar el array actual + nuevo dato
                } else {
                    const updatedDatos = datos.map((item: { [x: string]: any; }) =>
                        item[fields[0]] === datos[fields[0]] ? data : item
                    );
                    setDatos(updatedDatos); // Pasar el array actualizado directamente
                }
                handleClose();
            })
            .catch((e) => console.error(`Error al guardar en ${endpoint}:`, e));
    };

    return { handleSave, errors };
};
