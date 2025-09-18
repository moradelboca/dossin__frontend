import { Button, CircularProgress } from '@mui/material';
import { ContextoGeneral } from '../../../../../Contexto';
import { useContext } from 'react';

interface PlanificacionFormActionsProps {
    loading: boolean;
    nombreLote: string;
    campania: string;
    fechaSiembra: string;
    superficieCalculada: number | null;
    etapasGeneradas: any[];
    onClose: () => void;
    onSubmit: () => void;
}

export function PlanificacionFormActions({
    loading,
    nombreLote,
    campania,
    fechaSiembra,
    superficieCalculada,
    etapasGeneradas,
    onClose,
    onSubmit
}: PlanificacionFormActionsProps) {
    const { theme } = useContext(ContextoGeneral);

    const isFormValid = nombreLote.trim() && 
                       campania && 
                       fechaSiembra && 
                       superficieCalculada && 
                       superficieCalculada > 0 && 
                       etapasGeneradas.length > 0;

    return (
        <>
            <Button 
                onClick={onClose} 
                disabled={loading}
                variant="outlined"
                sx={{
                    borderColor: theme.colores.azul,
                    color: theme.colores.azul,
                    '&:hover': {
                        borderColor: theme.colores.azul,
                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                    }
                }}
            >
                Cancelar
            </Button>
            <Button
                onClick={onSubmit}
                variant="contained"
                disabled={loading || !isFormValid}
                startIcon={loading ? <CircularProgress size={16} /> : null}
                sx={{
                    backgroundColor: theme.colores.azul,
                    '&:hover': {
                        backgroundColor: theme.colores.azul,
                        opacity: 0.9
                    }
                }}
            >
                {loading ? 'Creando...' : 'Crear Planificación'}
            </Button>
        </>
    );
}

