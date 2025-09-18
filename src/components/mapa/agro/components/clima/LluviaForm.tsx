import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Grid,
    Alert,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Add as AddIcon,
    WaterDrop,
} from '@mui/icons-material';
import { RegistroLluvia } from '../../../../../types/agro';

interface LluviaFormProps {
    theme: any;
    onAddLluvia: (lluvia: Omit<RegistroLluvia, 'id' | 'registradoPor' | 'registradoEn' | 'fuente'>) => void;
    loading?: boolean;
}

export function LluviaForm({ theme, onAddLluvia, loading = false }: LluviaFormProps) {
    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        cantidad: '',
        unidad: 'mm',
        observaciones: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);

    const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Limpiar error cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fecha) {
            newErrors.fecha = 'La fecha es requerida';
        }

        if (!formData.cantidad || isNaN(Number(formData.cantidad)) || Number(formData.cantidad) <= 0) {
            newErrors.cantidad = 'La cantidad debe ser un número mayor a 0';
        }

        if (!formData.unidad) {
            newErrors.unidad = 'La unidad es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const lluviaData = {
            fecha: formData.fecha,
            cantidad: Number(formData.cantidad),
            unidad: formData.unidad,
            observaciones: formData.observaciones || undefined,
        };

        onAddLluvia(lluviaData);
        
        // Resetear formulario
        setFormData({
            fecha: new Date().toISOString().split('T')[0],
            cantidad: '',
            unidad: 'mm',
            observaciones: '',
        });
        
        setShowSuccess(true);
    };

    const handleCloseSuccess = () => {
        setShowSuccess(false);
    };

    return (
        <Box>
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ color: theme.colores.azul, mb: 2, display: 'flex', alignItems: 'center' }}>
                        <WaterDrop sx={{ mr: 1 }} />
                        Registrar Lluvia Manual
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Fecha de la lluvia"
                                    type="date"
                                    value={formData.fecha}
                                    onChange={handleInputChange('fecha')}
                                    error={!!errors.fecha}
                                    helperText={errors.fecha}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: theme.colores.azul,
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="Cantidad"
                                    type="number"
                                    value={formData.cantidad}
                                    onChange={handleInputChange('cantidad')}
                                    error={!!errors.cantidad}
                                    helperText={errors.cantidad}
                                    inputProps={{
                                        step: 0.1,
                                        min: 0,
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: theme.colores.azul,
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth error={!!errors.unidad}>
                                    <InputLabel>Unidad</InputLabel>
                                    <Select
                                        value={formData.unidad}
                                        onChange={(e) => setFormData(prev => ({ ...prev, unidad: e.target.value }))}
                                        label="Unidad"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: theme.colores.azul,
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem value="mm">mm</MenuItem>
                                        <MenuItem value="cm">cm</MenuItem>
                                        <MenuItem value="pulgadas">pulgadas</MenuItem>
                                    </Select>
                                    {errors.unidad && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                            {errors.unidad}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Observaciones (opcional)"
                                    multiline
                                    rows={2}
                                    value={formData.observaciones}
                                    onChange={handleInputChange('observaciones')}
                                    placeholder="Ej: Lluvia intensa, buena distribución, etc."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: theme.colores.azul,
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    disabled={loading}
                                    sx={{
                                        backgroundColor: theme.colores.azul,
                                        '&:hover': {
                                            backgroundColor: theme.colores.azulOscuro,
                                        },
                                    }}
                                >
                                    {loading ? 'Registrando...' : 'Registrar Lluvia'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

            <Snackbar
                open={showSuccess}
                autoHideDuration={3000}
                onClose={handleCloseSuccess}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
                    Lluvia registrada exitosamente
                </Alert>
            </Snackbar>
        </Box>
    );
}


