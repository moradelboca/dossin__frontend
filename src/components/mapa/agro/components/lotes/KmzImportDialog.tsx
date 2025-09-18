import React, { useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
} from '@mui/material';
import { Upload } from '@mui/icons-material';
import { Lote } from './types';

interface KmzImportDialogProps {
    open: boolean;
    onClose: () => void;
    selectedLote: Lote | null;
    onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function KmzImportDialog({
    open,
    onClose,
    selectedLote,
    onFileSelect,
}: KmzImportDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Importar KMZ para {selectedLote?.nombre}
            </DialogTitle>
            <DialogContent>
                <Alert severity="info" sx={{ mb: 2 }}>
                    Selecciona un archivo KMZ o KML para delimitar este lote en el mapa.
                </Alert>
                
                <Button
                    variant="contained"
                    component="label"
                    startIcon={<Upload />}
                    fullWidth
                    onClick={() => fileInputRef.current?.click()}
                >
                    Seleccionar archivo KMZ/KML
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".kmz,.kml"
                        onChange={onFileSelect}
                        style={{ display: 'none' }}
                    />
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    Cancelar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
