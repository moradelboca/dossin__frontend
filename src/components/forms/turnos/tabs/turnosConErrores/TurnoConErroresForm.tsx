import React, { useState, useContext } from "react";
import { Box, Button, Stepper, Step, StepLabel, TextField } from "@mui/material";
import { ContextoGeneral } from "../../../../Contexto";
import AutocompleteColaboradores from "../../../autocompletes/AutocompleteColaboradores";
import AutocompleteEmpresas from "../../../autocompletes/AutocompleteEmpresas";
import AutocompleteCamiones from "../../../autocompletes/AutocompleteCamiones";
import AutocompleteAcoplados from "../../../autocompletes/AutocompleteAcoplados";
import useValidationStepper from "../../../../hooks/useValidationStepper";

interface TurnoConErroresStepperFormProps {
  seleccionado?: any;
  datos: any;
  setDatos: any;
  handleClose: () => void;
}

const steps = [
  "Datos Principales",
  "Tara",
  "Factura",
  "Carta de Porte",
  "Granos",
  "Orden de Pago",
];

const TurnoConErroresStepperForm: React.FC<TurnoConErroresStepperFormProps> = ({
  seleccionado,
  datos,
  setDatos,
  handleClose,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const [activeStep, setActiveStep] = useState(0);

  // Estados para los valores de los autocompletes
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState<any | null>(
    seleccionado?.cuilColaborador || null
  );
  const [empresaTransportistaSeleccionada, setEmpresaTransportistaSeleccionada] = useState<any | null>(
    seleccionado?.cuitEmpresa || null
  );
  const [patenteCamionSeleccionada, setPatenteCamionSeleccionada] = useState<string | null>(
    seleccionado?.patenteCamion || null
  );
  const [patenteAcopladoSeleccionada, setPatenteAcopladoSeleccionada] = useState<string | null>(
    seleccionado?.patenteAcoplado || null
  );
  const [patenteAcopladoExtraSeleccionada, setPatenteAcopladoExtraSeleccionada] = useState<string | null>(
    seleccionado?.patenteAcopladoExtra || null
  );

  // Estados para los campos de Granos
  const [kgCargados, setKgCargados] = useState<number | string>(
    seleccionado?.kgCargados ?? ""
  );
  const [kgDescargados, setKgDescargados] = useState<number | string>(
    seleccionado?.kgDescargados ?? ""
  );
  const [precioGrano, setPrecioGrano] = useState<number | string>(
    seleccionado?.precioGrano ?? ""
  );

  // Validaciones de los campos
  const rules = {
    cuilColaborador: () => (!colaboradorSeleccionado ? "El colaborador es obligatorio" : null),
    cuitEmpresa: () => (!empresaTransportistaSeleccionada ? "La empresa es obligatoria" : null),
    patenteCamion: () => (!patenteCamionSeleccionada ? "La patente del camión es obligatoria" : null),
    patenteAcoplado: () => (!patenteAcopladoSeleccionada ? "La patente del acoplado es obligatoria" : null),
    kgCargados: () => {
      if (kgCargados === "" || isNaN(Number(kgCargados))) 
        return "Kilogramos cargados es obligatorio y debe ser un número";
      return null;
    },
    kgDescargados: () => {
      if (kgDescargados === "" || isNaN(Number(kgDescargados))) 
        return "Kilogramos descargados es obligatorio y debe ser un número";
      return null;
    },
    precioGrano: () => {
      if (precioGrano === "" || isNaN(Number(precioGrano))) 
        return "Precio grano es obligatorio y debe ser un número";
      return null;
    }
  };

  const { errors, validateStep } = useValidationStepper(
    {
      cuilColaborador: "",
      cuitEmpresa: "",
      patenteCamion: "",
      patenteAcoplado: "",
      kgCargados: "",
      kgDescargados: "",
      precioGrano: "",
    },
    rules,
    { 
      0: ["cuilColaborador", "cuitEmpresa", "patenteCamion", "patenteAcoplado"],
      4: ["kgCargados", "kgDescargados", "precioGrano"] 
    }
  );

  const handleNext = () => {
    if (!validateStep(activeStep)) {
      console.log("Errores en la validación", errors);
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        idEstado: 3,
        cuilColaborador: colaboradorSeleccionado,
        cuitEmpresa: empresaTransportistaSeleccionada,
        patenteCamion: patenteCamionSeleccionada,
        patenteAcoplado: patenteAcopladoSeleccionada,
        patenteAcopladoExtra: patenteAcopladoExtraSeleccionada || null,
        kgCargados: Number(kgCargados),
        kgDescargados: Number(kgDescargados),
        precioGrano: Number(precioGrano),
      };

      const url = `${backendURL}/turnos/errores/${seleccionado.id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await response.text());
      const updatedData = await response.json();

      setDatos(
        datos.map((turno: any) =>
          turno.id === seleccionado.id ? updatedData : turno
        )
      );
      handleClose();
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
    }
  };

  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number | string>>
  ) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <AutocompleteColaboradores
              value={colaboradorSeleccionado}
              onChange={setColaboradorSeleccionado}
              error={!!errors.cuilColaborador}
              helperText={errors.cuilColaborador}
            />
            <AutocompleteEmpresas
              value={empresaTransportistaSeleccionada}
              onChange={setEmpresaTransportistaSeleccionada}
              error={!!errors.cuitEmpresa}
              helperText={errors.cuitEmpresa}
            />
            <AutocompleteCamiones
              value={patenteCamionSeleccionada}
              onChange={setPatenteCamionSeleccionada}
              error={!!errors.patenteCamion}
              helperText={errors.patenteCamion}
            />
            <AutocompleteAcoplados
              value={patenteAcopladoSeleccionada}
              onChange={setPatenteAcopladoSeleccionada}
              error={!!errors.patenteAcoplado}
              helperText={errors.patenteAcoplado}
            />
            <AutocompleteAcoplados
              value={patenteAcopladoExtraSeleccionada}
              onChange={setPatenteAcopladoExtraSeleccionada}
              tituloOpcional="Patente Acoplado Extra"
            />
          </Box>
        );
      case 1:
        return <Box><p>Contenido del formulario de Tara (placeholder).</p></Box>;
      case 2:
        return <Box><p>Contenido del formulario de Factura (placeholder).</p></Box>;
      case 3:
        return <Box><p>Contenido del formulario de Carta de Porte (placeholder).</p></Box>;
        case 4:
            return (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  label="Kilogramos Cargados"
                  value={kgCargados}
                  onChange={(e) => handleNumericInput(e, setKgCargados)}
                  error={!!errors.kgCargados}
                  helperText={errors.kgCargados}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
                  fullWidth
                />
                <TextField
                  label="Kilogramos Descargados"
                  value={kgDescargados}
                  onChange={(e) => handleNumericInput(e, setKgDescargados)}
                  error={!!errors.kgDescargados}
                  helperText={errors.kgDescargados}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
                  fullWidth
                />
                <TextField
                  label="Precio Grano"
                  value={precioGrano}
                  onChange={(e) => handleNumericInput(e, setPrecioGrano)}
                  error={!!errors.precioGrano}
                  helperText={errors.precioGrano}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
                  fullWidth
                />
              </Box>
            );
      case 5:
        return <Box><p>Contenido del formulario de Orden de Pago (placeholder).</p></Box>;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4 }}>{renderStepContent(activeStep)}</Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 4,
        }}
      >
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Anterior
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button variant="contained" onClick={handleSubmit}>
            Guardar Datos
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Siguiente
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TurnoConErroresStepperForm;
