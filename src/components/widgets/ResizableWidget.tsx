import { Box, Card, CardContent, Typography } from "@mui/material";
import { useRef, useState, useEffect } from "react";
import { Archivo } from "../../interfaces/archivo";
import { archivosService } from "../../services/archivosService";

interface ResizableWidgetProps {
  archivo: Archivo;
}

export function ResizableWidget({ archivo }: ResizableWidgetProps) {
  const [size, setSize] = useState({ width: 600, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeTypeRef = useRef<string>('');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const type = resizeTypeRef.current;

      let newWidth = size.width;
      let newHeight = size.height;

      if (type.includes('right')) {
        newWidth = Math.max(300, e.clientX - rect.left);
      }
      if (type.includes('bottom')) {
        newHeight = Math.max(300, e.clientY - rect.top);
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeTypeRef.current = '';
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, size]);

  const handleResizeStart = (type: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeTypeRef.current = type;
    
    if (type === 'right') {
      document.body.style.cursor = 'ew-resize';
    } else if (type === 'bottom') {
      document.body.style.cursor = 'ns-resize';
    } else if (type === 'bottom-right') {
      document.body.style.cursor = 'nwse-resize';
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: `${size.width}px`,
        height: `${size.height}px`,
        minWidth: '300px',
        minHeight: '300px',
        display: 'inline-block',
        flexShrink: 0,
        mr: 3,
      }}
    >
      <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" gutterBottom>
            {archivo.nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {archivo.descripcion}
          </Typography>
        </CardContent>
        <Box sx={{ flex: 1, px: 2, pb: 2, minHeight: 0 }}>
          <iframe
            src={archivosService.obtenerUrlContenido(archivo.id)}
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              pointerEvents: isResizing ? 'none' : 'auto'
            }}
            title={archivo.nombre}
          />
        </Box>
      </Card>

      {/* Resize handle - right */}
      <Box
        onMouseDown={handleResizeStart('right')}
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '8px',
          cursor: 'ew-resize',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.2)',
          },
        }}
      />

      {/* Resize handle - bottom */}
      <Box
        onMouseDown={handleResizeStart('bottom')}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '8px',
          cursor: 'ns-resize',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.2)',
          },
        }}
      />

      {/* Resize handle - bottom-right corner */}
      <Box
        onMouseDown={handleResizeStart('bottom-right')}
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '16px',
          height: '16px',
          cursor: 'nwse-resize',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.4)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '0',
            height: '0',
            borderStyle: 'solid',
            borderWidth: '0 0 10px 10px',
            borderColor: 'transparent transparent #999 transparent',
          }
        }}
      />
    </Box>
  );
}
