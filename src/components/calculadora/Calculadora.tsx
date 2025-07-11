/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  useMediaQuery,
  Tabs,
  Tab,
} from "@mui/material";
import Papa from "papaparse";
import { BotonIcon } from "../botones/IconButton";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import {
  NumericFormat,
  NumericFormatProps,
  PatternFormat,
} from "react-number-format";
import { ContextoGeneral } from "../Contexto";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

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

const TarifaApp: React.FC = () => {
  const { theme } = useContext(ContextoGeneral);
  const isMobile = useMediaQuery("(max-width:768px)");

  // estados de formulario
  const [km, setKm] = useState<number | null>(null);
  const [tn, setTn] = useState<number | null>(null);
  const [precio, setPrecio] = useState<number | null>(null);
  const [descuento, setDescuento] = useState<number>(0);
  const [contraFlete, setContraFlete] = useState<number | null>(null);

  // errores
  const [kmError, setKmError] = useState<string | null>(null);
  const [tnError, setTnError] = useState<string | null>(null);

  // estados de resultado
  const [tarifaSinDescuento, setTarifaSinDescuento] = useState<number | null>(null);
  const [tarifaConDescuento, setTarifaConDescuento] = useState<number | null>(null);
  const [tarifaPorKm, setTarifaPorKm] = useState<number | null>(null);
  const [tarifaPorKmConDescuento, setTarifaPorKmConDescuento] = useState<number | null>(null);
  const [tarifaPorTonelada, setTarifaPorTonelada] = useState<number | null>(null);
  const [tarifaPorToneladaConDescuento, setTarifaPorToneladaConDescuento] = useState<number | null>(null);
  const [tarifaPorToneladaConDescuentoContra, setTarifaPorToneladaConDescuentoContra] = useState<number | null>(null);
  const [incidenciaConDescuento, setIncidenciaConDescuento] = useState<number | null>(null);
  const [incideciasConDescContra, setIncideciasConDescContra] = useState<number | null>(null);

  // solo móvil: control de pestaña
  const [tabValue, setTabValue] = useState(0);
  const handleTabChangeMobile = (_: any, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCalcular = async () => {
    let hasError = false;
    setKmError(null);
    setTnError(null);
    if (km !== null && km > 1500) {
      setKmError("No puede ser mayor a 1500");
      hasError = true;
    }
    if (tn !== null && tn > 50) {
      setTnError("No puede ser mayor a 50");
      hasError = true;
    }
    if (hasError) return;

    const res = await fetch("/tarifas.csv");
    const text = await res.text();
    const data = Papa.parse<string[]>(text, { header: false }).data;
    const fila = data.find((f) => parseInt(f[0]) === km);
    if (!fila) return;
    const tpv = parseFloat(fila[1]);
    setTarifaPorTonelada(tpv);

    if (tn !== null) {
      const bruta = tpv * tn;
      const conDesc = bruta - (bruta * descuento) / 100;
      const tpvConDesc = tpv - (tpv * descuento) / 100;
      setTarifaSinDescuento(bruta);
      setTarifaConDescuento(conDesc);
      setTarifaPorToneladaConDescuento(tpvConDesc);

      const tonDescContra = (tpvConDesc + (contraFlete || 0)) * tn;
      setTarifaPorToneladaConDescuentoContra(tonDescContra);

      if (km) {
        setTarifaPorKm(bruta / km);
        setTarifaPorKmConDescuento(conDesc / km);
      }
      if (precio && tn) {
        setIncidenciaConDescuento((conDesc / (precio * tn)) * 100);
        setIncideciasConDescContra((tonDescContra / (precio * tn)) * 100);
      }
    }

    // en móvil, saltar a resultados
    if (isMobile) setTabValue(1);
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
  const rows = [
    { id: 1, concepto: "Tarifa ($/tn)", valor: tarifaPorTonelada != null ? formatMoney(tarifaPorTonelada) : "-" },
    { id: 2, concepto: "Tarifa total ($)", valor: tarifaSinDescuento != null ? formatMoney(tarifaSinDescuento) : "-" },
    { id: 3, concepto: "Tarifa con descuento ($/tn)", valor: tarifaPorToneladaConDescuento != null ? formatMoney(tarifaPorToneladaConDescuento) : "-" },
    { id: 4, concepto: "Tarifa total con descuento ($)", valor: tarifaConDescuento != null ? formatMoney(tarifaConDescuento) : "-" },
    { id: 5, concepto: "Tarifa total c/ descuento y Contraflete ($)", valor: tarifaPorToneladaConDescuentoContra != null ? formatMoney(tarifaPorToneladaConDescuentoContra) : "-" },
    { id: 6, concepto: "Tarifa por KM ($/km)", valor: tarifaPorKm != null ? formatMoney(tarifaPorKm) : "-" },
    { id: 7, concepto: "Tarifa por KM c/ Descuento ($/km)", valor: tarifaPorKmConDescuento != null ? formatMoney(tarifaPorKmConDescuento) : "-" },
    { id: 8, concepto: "Incidencia c/ descuento (%)", valor: incidenciaConDescuento != null ? incidenciaConDescuento.toFixed(2) : "-" },
    { id: 9, concepto: "Incidencia c/ desc. y contraflete (%)", valor: incideciasConDescContra != null ? incideciasConDescContra.toFixed(2) : "-" },
  ];

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
        Calculadora
      </Typography>

      {isMobile ? (
        // === MÓVIL: Tabs como en HistorialTurnos ===
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
              <BotonIcon onClick={handleCalcular} title="Calcular tarifa" icon={<CalculateOutlinedIcon />} />
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ px: 1 }}>
              <DataGrid
                rows={rows}
                columns={columns}
                hideFooter
                autoHeight
                sx={{ backgroundColor: "#fff", borderRadius: "16px" }}
              />
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
            <TextField
              label="Kilómetros a recorrer"
              value={km ?? ""}
              onChange={(e) => setKm(parseInt(e.target.value))}
              slotProps={{ input: { inputComponent: KmFormat as any } }}
              sx={{ width: "100%", ...azulStyles }}
              error={!!kmError}
              helperText={kmError}
            />
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
            <BotonIcon onClick={handleCalcular} title="Calcular tarifa" icon={<CalculateOutlinedIcon />} />
          </Box>
          <Box sx={{ width: "100%", padding: 3, maxWidth: "600px", minWidth: "100px" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              hideFooter
              sx={{ backgroundColor: "#fff", borderRadius: "16px" }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TarifaApp;
