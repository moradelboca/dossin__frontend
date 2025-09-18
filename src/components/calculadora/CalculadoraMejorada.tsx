/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  Tabs,
  Tab,
  Card,
  CardContent,
  // Grid, // No se usa
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
// import Papa from "papaparse"; // No se usa
import { BotonIcon } from "../botones/IconButton";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import {
  NumericFormat,
  NumericFormatProps,
  PatternFormat,
} from "react-number-format";
import { ContextoGeneral } from "../Contexto";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { UbicacionSelector } from "./UbicacionSelector";
import { useUbicacionesCalculadora } from "../../hooks/useUbicacionesCalculadora";
import { useCalculoTarifa, Ubicacion } from "../../hooks/useCalculoTarifa";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

// ---- formateadores (igual que antes) ----
const KmFormat = React.forwardRef<NumericFormatProps, CustomProps>(function KmFormat(props, ref) {
  const { onChange, ...other } = props;
  const isAllowed = (values: any) => values.formattedValue.replace(/[.,]/g, "").length <= 4;
  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={0}
      fixedDecimalScale
      allowNegative={false}
      isAllowed={isAllowed}
      onValueChange={(values) =>
        onChange({ target: { name: props.name, value: values.value } })
      }
    />
  );
});

const TnFormat = React.forwardRef<NumericFormatProps, CustomProps>(function TnFormat(props, ref) {
  const { onChange, ...other } = props;
  const isAllowed = (values: any) => values.formattedValue.replace(/[.,]/g, "").length <= 2;
  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={0}
      fixedDecimalScale
      allowNegative={false}
      isAllowed={isAllowed}
      onValueChange={(values) =>
        onChange({ target: { name: props.name, value: values.value } })
      }
    />
  );
});

const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>(function NumericFormatCustom(props, ref) {
  const { onChange, ...other } = props;
  const isAllowed = (values: any) => values.formattedValue.replace(/[$.,]/g, "").length <= 9;
  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      thousandSeparator="."
      decimalSeparator=","
      prefix="$"
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      isAllowed={isAllowed}
      onValueChange={(values) =>
        onChange({ target: { name: props.name, value: values.value } })
      }
    />
  );
});

const ContraFleteFormat = React.forwardRef<NumericFormatProps, CustomProps>(function ContraFleteFormat(props, ref) {
  const { onChange, ...other } = props;
  const isAllowed = (values: any) => values.formattedValue.replace(/[$.,]/g, "").length <= 7;
  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      thousandSeparator="."
      decimalSeparator=","
      prefix="$"
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      isAllowed={isAllowed}
      onValueChange={(values) =>
        onChange({ target: { name: props.name, value: values.value } })
      }
    />
  );
});

const PorcentajeFormat = React.forwardRef<any, CustomProps>(function PorcentajeFormat(props, ref) {
  const { onChange, ...other } = props;
  return (
    <PatternFormat
      {...other}
      getInputRef={ref}
      format="##%"
      mask=""
      onValueChange={(values) => {
        const num = Number(values.value.replace("%", ""));
        if (num < 0) return;
        onChange({ target: { name: props.name, value: values.value } });
      }}
    />
  );
});

function formatMoney(value: any) {
  if (typeof value !== 'number' && isNaN(Number(value))) return value;
  return Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const CalculadoraMejorada: React.FC = () => {
  const { theme } = useContext(ContextoGeneral);
  const isMobile = useMediaQuery("(max-width:768px)");
  const { ubicaciones, loading: cargandoUbicaciones, error: errorUbicaciones } = useUbicacionesCalculadora();
  const { calcularTarifa, cargando: calculandoTarifa, error: errorTarifa } = useCalculoTarifa();

  // Estados de formulario
  const [usarUbicaciones, setUsarUbicaciones] = useState(false);
  const [ubicacionOrigen, setUbicacionOrigen] = useState<Ubicacion | null>(null);
  const [ubicacionDestino, setUbicacionDestino] = useState<Ubicacion | null>(null);
  const [km, setKm] = useState<number | null>(null);
  const [tn, setTn] = useState<number | null>(null);
  const [precio, setPrecio] = useState<number | null>(null);
  const [descuento, setDescuento] = useState<number>(0);
  const [contraFlete, setContraFlete] = useState<number | null>(null);

  // errores
  const [kmError, setKmError] = useState<string | null>(null);
  const [tnError, setTnError] = useState<string | null>(null);

  // estados de resultado
  const [resultado, setResultado] = useState<any>(null);

  // solo móvil: control de pestaña
  const [tabValue, setTabValue] = useState(0);
  const handleTabChangeMobile = (_: any, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCalcular = async () => {
    let hasError = false;
    setKmError(null);
    setTnError(null);

    if (tn !== null && tn > 50) {
      setTnError("No puede ser mayor a 50");
      hasError = true;
    }

    if (usarUbicaciones) {
      if (!ubicacionOrigen || !ubicacionDestino) {
        hasError = true;
      }
    } else {
      if (km !== null && km > 1500) {
        setKmError("No puede ser mayor a 1500");
        hasError = true;
      }
    }

    if (hasError) return;

    try {
      const parametros = {
        ubicacionOrigen: usarUbicaciones ? ubicacionOrigen : null,
        ubicacionDestino: usarUbicaciones ? ubicacionDestino : null,
        toneladas: tn,
        precioGrano: precio,
        descuento,
        contraFlete,
        distanciaManual: !usarUbicaciones ? km : null,
      };

      const resultadoCalculado = await calcularTarifa(parametros);
      if (resultadoCalculado) {
        setResultado(resultadoCalculado);
        // en móvil, saltar a resultados
        if (isMobile) setTabValue(1);
      }
    } catch (error) {
      console.error('Error calculando tarifa:', error);
    }
  };

  // DataGrid
  const columns: GridColDef[] = [
    {
      field: "concepto",
      headerName: "Concepto",
      flex: 2,
      renderHeader: () => <strong style={{ color: theme.colores.grisOscuro }}>Concepto</strong>,
    },
    {
      field: "valor",
      headerName: "Valor",
      flex: 1,
      renderHeader: () => <strong style={{ color: theme.colores.grisOscuro }}>Valor</strong>,
    },
  ];

  const rows = resultado ? [
    { id: 1, concepto: "Distancia calculada (km)", valor: resultado.distanciaCalculada },
    { id: 2, concepto: "Tarifa ($/tn)", valor: formatMoney(resultado.tarifaPorTonelada) },
    { id: 3, concepto: "Tarifa total ($)", valor: formatMoney(resultado.tarifaSinDescuento) },
    { id: 4, concepto: "Tarifa con descuento ($/tn)", valor: formatMoney(resultado.tarifaPorToneladaConDescuento) },
    { id: 5, concepto: "Tarifa total con descuento ($)", valor: formatMoney(resultado.tarifaConDescuento) },
    { id: 6, concepto: "Tarifa total c/ descuento y Contraflete ($)", valor: formatMoney(resultado.tarifaPorToneladaConDescuentoContra) },
    { id: 7, concepto: "Tarifa por KM ($/km)", valor: formatMoney(resultado.tarifaPorKm) },
    { id: 8, concepto: "Tarifa por KM c/ Descuento ($/km)", valor: formatMoney(resultado.tarifaPorKmConDescuento) },
    { id: 9, concepto: "Incidencia c/ descuento (%)", valor: resultado.incidenciaConDescuento.toFixed(2) },
    { id: 10, concepto: "Incidencia c/ desc. y contraflete (%)", valor: resultado.incidenciaConDescContra.toFixed(2) },
  ] : [];

  // Estilo para el borde y label azul al enfocar
  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.colores.grisClaro,
        height: '100%',
        width: '100%',
        padding: 3,
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: theme.colores.azul,
          fontWeight: "bold",
          mb: 2,
          fontSize: "2rem",
          pb: 1,
          marginLeft: 1,
        }}
      >
        Calculadora de Fletes
      </Typography>

      {/* Toggle para usar ubicaciones */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControlLabel
            control={
              <Switch
                checked={usarUbicaciones}
                onChange={(e) => setUsarUbicaciones(e.target.checked)}
                color="primary"
              />
            }
            label="Usar ubicaciones para cálculo automático de distancia"
          />
        </CardContent>
      </Card>

      {isMobile ? (
        // === MÓVIL: Tabs ===
        <>
          <Tabs
            value={tabValue}
            onChange={handleTabChangeMobile}
            TabIndicatorProps={{
              style: { backgroundColor: theme.colores.azul, height: 3, borderRadius: 2 }
            }}
            sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}
          >
            <Tab 
              label="Ingreso de datos"
              sx={{
                flex: 1,
                color: theme.colores.grisOscuro,
                fontWeight: 'normal',
                borderBottom: '3px solid transparent',
                transition: 'color 0.2s, border-bottom 0.2s',
                textTransform: 'none',
                fontSize: '1rem',
                minHeight: 48,
                '&.Mui-selected': {
                  color: theme.colores.azul,
                  fontWeight: 'bold',
                  borderBottom: `3px solid ${theme.colores.azul}`,
                }
              }}
            />
            <Tab 
              label="Resultados"
              sx={{
                flex: 1,
                color: theme.colores.grisOscuro,
                fontWeight: 'normal',
                borderBottom: '3px solid transparent',
                transition: 'color 0.2s, border-bottom 0.2s',
                textTransform: 'none',
                fontSize: '1rem',
                minHeight: 48,
                '&.Mui-selected': {
                  color: theme.colores.azul,
                  fontWeight: 'bold',
                  borderBottom: `3px solid ${theme.colores.azul}`,
                }
              }}
            />
          </Tabs>

          {tabValue === 0 && (
            <Box display="flex" flexDirection="column" gap={2} px={1}>
              {usarUbicaciones ? (
                <>
                  <UbicacionSelector
                    ubicaciones={ubicaciones}
                    ubicacionSeleccionada={ubicacionOrigen}
                    onUbicacionChange={setUbicacionOrigen}
                    label="Ubicación de Origen"
                    tipoFiltro="Carga"
                    loading={cargandoUbicaciones}
                    error={errorUbicaciones}
                  />
                  <UbicacionSelector
                    ubicaciones={ubicaciones}
                    ubicacionSeleccionada={ubicacionDestino}
                    onUbicacionChange={setUbicacionDestino}
                    label="Ubicación de Destino"
                    tipoFiltro="Descarga"
                    loading={cargandoUbicaciones}
                    error={errorUbicaciones}
                  />
                </>
              ) : (
                <TextField
                  label="Kilómetros a recorrer"
                  value={km ?? ""}
                  onChange={(e) => setKm(parseInt(e.target.value))}
                  slotProps={{ input: { inputComponent: KmFormat as any } }}
                  fullWidth
                  sx={azulStyles}
                  error={!!kmError}
                  helperText={kmError}
                />
              )}

              <TextField
                label="Toneladas a transportar"
                value={tn ?? ""}
                onChange={(e) => setTn(parseInt(e.target.value))}
                slotProps={{ input: { inputComponent: TnFormat as any } }}
                fullWidth
                sx={azulStyles}
                error={!!tnError}
                helperText={tnError}
              />
              <TextField
                label="Precio del grano de referencia"
                value={precio ?? ""}
                onChange={(e) => setPrecio(parseInt(e.target.value))}
                slotProps={{ input: { inputComponent: NumericFormatCustom as any } }}
                fullWidth
                sx={azulStyles}
              />
              <TextField
                label="Porcentaje de Descuento"
                value={descuento}
                onChange={(e) => setDescuento(parseFloat(e.target.value))}
                slotProps={{ input: { inputComponent: PorcentajeFormat as any } }}
                fullWidth
                sx={azulStyles}
              />
              <TextField
                label="Contra flete"
                value={contraFlete ?? ""}
                onChange={(e) => setContraFlete(parseInt(e.target.value))}
                slotProps={{ input: { inputComponent: ContraFleteFormat as any } }}
                fullWidth
                sx={azulStyles}
              />
              
              {errorTarifa && (
                <Alert severity="error">
                  {errorTarifa}
                </Alert>
              )}

              <BotonIcon 
                onClick={handleCalcular} 
                title="Calcular tarifa" 
                icon={<CalculateOutlinedIcon />}
                disabled={calculandoTarifa}
              />
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ px: 1 }}>
              {resultado ? (
                <DataGrid
                  rows={rows}
                  columns={columns}
                  hideFooter
                  autoHeight
                  sx={{ backgroundColor: "#fff", borderRadius: "16px" }}
                />
              ) : (
                <Alert severity="info">
                  Realiza un cálculo para ver los resultados
                </Alert>
              )}
            </Box>
          )}
        </>
      ) : (
        // === DESKTOP: layout original ===
        <Box display="flex" flexDirection="row" gap={2} alignItems="flex-start">
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            width="500px"
            padding={3}
            justifyContent="center"
            alignItems="center"
          >
            {usarUbicaciones ? (
              <>
                <UbicacionSelector
                  ubicaciones={ubicaciones}
                  ubicacionSeleccionada={ubicacionOrigen}
                  onUbicacionChange={setUbicacionOrigen}
                  label="Ubicación de Origen"
                  tipoFiltro="Carga"
                  loading={cargandoUbicaciones}
                  error={errorUbicaciones}
                />
                <UbicacionSelector
                  ubicaciones={ubicaciones}
                  ubicacionSeleccionada={ubicacionDestino}
                  onUbicacionChange={setUbicacionDestino}
                  label="Ubicación de Destino"
                  tipoFiltro="Descarga"
                  loading={cargandoUbicaciones}
                  error={errorUbicaciones}
                />
              </>
            ) : (
              <TextField
                label="Kilómetros a recorrer"
                value={km ?? ""}
                onChange={(e) => setKm(parseInt(e.target.value))}
                slotProps={{ input: { inputComponent: KmFormat as any } }}
                sx={{ width: "100%", ...azulStyles }}
                error={!!kmError}
                helperText={kmError}
              />
            )}

            <TextField
              label="Toneladas a transportar"
              value={tn ?? ""}
              onChange={(e) => setTn(parseInt(e.target.value))}
              slotProps={{ input: { inputComponent: TnFormat as any } }}
              sx={{ width: "100%", ...azulStyles }}
              error={!!tnError}
              helperText={tnError}
            />
            <TextField
              label="Precio del grano de referencia"
              value={precio ?? ""}
              onChange={(e) => setPrecio(parseInt(e.target.value))}
              slotProps={{ input: { inputComponent: NumericFormatCustom as any } }}
              sx={{ width: "100%", ...azulStyles }}
            />
            <TextField
              label="Porcentaje de Descuento"
              value={descuento}
              onChange={(e) => setDescuento(parseFloat(e.target.value))}
              slotProps={{ input: { inputComponent: PorcentajeFormat as any } }}
              sx={{ width: "100%", ...azulStyles }}
            />
            <TextField
              label="Contra flete"
              value={contraFlete ?? ""}
              onChange={(e) => setContraFlete(parseInt(e.target.value))}
              slotProps={{ input: { inputComponent: ContraFleteFormat as any } }}
              sx={{ width: "100%", ...azulStyles }}
            />
            
            {errorTarifa && (
              <Alert severity="error">
                {errorTarifa}
              </Alert>
            )}

            <BotonIcon 
              onClick={handleCalcular} 
              title="Calcular tarifa" 
              icon={<CalculateOutlinedIcon />}
              disabled={calculandoTarifa}
            />
          </Box>
          <Box sx={{ width: "100%", padding: 3, maxWidth: "600px", minWidth: "100px" }}>
            {resultado ? (
              <DataGrid
                rows={rows}
                columns={columns}
                hideFooter
                sx={{ backgroundColor: "#fff", borderRadius: "16px" }}
              />
            ) : (
              <Alert severity="info">
                Realiza un cálculo para ver los resultados
              </Alert>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CalculadoraMejorada;

