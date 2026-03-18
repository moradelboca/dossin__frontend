import { useEffect, useMemo } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { blobToObjectUrl } from "../../utils/pdfUtils";

export interface PdfViewerDialogProps {
  open: boolean;
  title?: string;
  blob: Blob | null;
  onClose: () => void;
}

export default function PdfViewerDialog({
  open,
  title = "PDF",
  blob,
  onClose,
}: PdfViewerDialogProps) {
  const url = useMemo(() => {
    if (!open || !blob) return null;
    return blobToObjectUrl(blob);
  }, [open, blob]);

  useEffect(() => {
    return () => {
      if (url && typeof URL.revokeObjectURL === "function") {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ pr: 6 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" component="div" sx={{ flex: 1 }}>
            {title}
          </Typography>
          <IconButton
            aria-label="Cerrar"
            onClick={onClose}
            size="small"
            sx={{ ml: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        {url ? (
          <Box
            component="iframe"
            title={title}
            src={url}
            sx={{
              width: "100%",
              height: { xs: "70vh", md: "78vh" },
              border: 0,
              borderRadius: 1,
            }}
          />
        ) : (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No hay PDF para mostrar.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

