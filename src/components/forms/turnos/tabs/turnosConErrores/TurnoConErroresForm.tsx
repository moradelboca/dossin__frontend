import React, { useState, useContext, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { ContextoGeneral } from "../../../../Contexto";
import AutocompleteColaboradores from "../../../autocompletes/AutocompleteColaboradores";
import AutocompleteEmpresas from "../../../autocompletes/AutocompleteEmpresas";
import AutocompleteCamiones from "../../../autocompletes/AutocompleteCamiones";
import AutocompleteAcoplados from "../../../autocompletes/AutocompleteAcoplados";

interface TurnoConErroresFormProps {
  seleccionado?: any;
  datos: any;
  setDatos: (data: any) => void;
  handleClose: () => void;
  idCarga: any;
  refreshCupos?: () => void;
}

const TurnoConErroresForm: React.FC<TurnoConErroresFormProps> = ({
  seleccionado,
  datos,
  setDatos,
  handleClose,
  idCarga,
  refreshCupos,
}) => {
  const { backendURL, theme } = useContext(ContextoGeneral);

  // Estado para saber si se requiere el bitren
  const [tieneBitren, setTieneBitren] = useState<boolean | null>(null);

  // Estados para errores de validación
  const [errores, setErrores] = useState({
    colaborador: '',
    empresa: '',
    camion: '',
    acoplado: '',
    acopladoExtra: '',
  });

  useEffect(() => {
    const fetchRequiereBitren = async () => {
      try {
        const response = await fetch(`${backendURL}/cargas/${idCarga}/requiere-bitren`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Supongamos que data es un booleano que indica si requiere bitren
          setTieneBitren(Array.isArray(data) && data.length > 0 ? true : false);
        } else {
          throw new Error("No se pudo obtener el estado de requiere-bitren");
        }
      } catch (error) {
        console.error("Error fetching requiere-bitren:", error);
        setTieneBitren(false);
      }
    };

    if (idCarga) {
      fetchRequiereBitren();
    }
  }, [backendURL, idCarga]);

  // Definimos qué campos se deben mostrar basándonos en el valor de "errores"
  let fieldsToShow: string[] = [];
  const allowedFields = [
    "colaborador",
    "empresa",
    "patenteCamion",
    "patenteAcoplado",
    "patenteAcopladoExtra",
  ];

  if (seleccionado && Array.isArray(seleccionado.errores)) {
    const filtered = seleccionado.errores.filter(
      (field: string) => allowedFields.includes(field)
    );
    fieldsToShow = filtered.length > 0 ? filtered : allowedFields;
  } else {
    // Si "errores" no es un array o es, por ejemplo, la cadena "error", mostramos todos
    fieldsToShow = allowedFields;
  }

  // Estados para cada uno de los campos
  // --- COLABORADOR ---
  const colaboradorEsObjeto = seleccionado?.colaborador && typeof seleccionado.colaborador === 'object';
  const colaboradorValor = colaboradorEsObjeto ? String(seleccionado.colaborador.cuil) : seleccionado?.colaborador !== undefined && seleccionado?.colaborador !== null ? String(seleccionado.colaborador) : null;
  const colaboradorError = !colaboradorEsObjeto && !!colaboradorValor;

  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState<string | null>(colaboradorValor);

  // --- EMPRESA ---
  const empresaEsObjeto = seleccionado?.empresa && typeof seleccionado.empresa === 'object';
  const empresaValor = empresaEsObjeto ? String(seleccionado.empresa.cuit) : seleccionado?.empresa !== undefined && seleccionado?.empresa !== null ? String(seleccionado.empresa) : null;
  const empresaError = !empresaEsObjeto && !!empresaValor;

  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string | null>(empresaValor);

  // --- CAMION ---
  const camionEsObjeto = seleccionado?.camion && typeof seleccionado.camion === 'object';
  const camionValor = camionEsObjeto ? seleccionado.camion.patente : seleccionado?.camion?.toString() || null;
  const camionError = !camionEsObjeto && !!camionValor;

  const [patenteCamionSeleccionada, setPatenteCamionSeleccionada] = useState<string | null>(camionValor);

  // --- ACOPLADO ---
  const acopladoEsObjeto = seleccionado?.acoplado && typeof seleccionado.acoplado === 'object';
  const acopladoValor = acopladoEsObjeto ? seleccionado.acoplado.patente : seleccionado?.acoplado?.toString() || null;
  const acopladoError = !acopladoEsObjeto && !!acopladoValor;

  const [patenteAcopladoSeleccionada, setPatenteAcopladoSeleccionada] = useState<string | null>(acopladoValor);

  // --- ACOPLADO EXTRA ---
  const acopladoExtraEsObjeto = seleccionado?.acopladoExtra && typeof seleccionado.acopladoExtra === 'object';
  const acopladoExtraValor = acopladoExtraEsObjeto ? seleccionado.acopladoExtra.patente : seleccionado?.acopladoExtra?.toString() || null;
  const acopladoExtraError = !acopladoExtraEsObjeto && !!acopladoExtraValor;

  const [patenteAcopladoExtraSeleccionada, setPatenteAcopladoExtraSeleccionada] = useState<string | null>(acopladoExtraValor);

  // Sincronizar estados con seleccionado cada vez que cambia
  useEffect(() => {
    setColaboradorSeleccionado(colaboradorValor);
    setEmpresaSeleccionada(empresaValor);
    setPatenteCamionSeleccionada(camionValor);
    setPatenteAcopladoSeleccionada(acopladoValor);
    setPatenteAcopladoExtraSeleccionada(acopladoExtraValor);
  }, [colaboradorValor, empresaValor, camionValor, acopladoValor, acopladoExtraValor]);

  const handleSubmit = async () => {
    // Validación de campos obligatorios
    const nuevosErrores: typeof errores = {
      colaborador: !colaboradorSeleccionado ? 'Debe seleccionar un colaborador' : '',
      empresa: !empresaSeleccionada ? 'Debe seleccionar una empresa' : '',
      camion: !patenteCamionSeleccionada ? 'Debe seleccionar un camión' : '',
      acoplado: !patenteAcopladoSeleccionada ? 'Debe seleccionar un acoplado' : '',
      acopladoExtra: tieneBitren && !patenteAcopladoExtraSeleccionada ? 'Debe seleccionar un acoplado extra' : '',
    };
    setErrores(nuevosErrores);
    // Si hay algún error, no enviar
    if (Object.values(nuevosErrores).some(e => !!e)) return;

    const payload = {
      cuilColaborador: colaboradorSeleccionado,
      cuitEmpresa: empresaSeleccionada,
      patenteCamion: patenteCamionSeleccionada,
      patenteAcoplado: patenteAcopladoSeleccionada,
      patenteAcopladoExtra: patenteAcopladoExtraSeleccionada || null,
    };


    try {
      const response = await fetch(`${backendURL}/turnos/${seleccionado.id}`, {
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
      if (refreshCupos) refreshCupos();
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 4 }}>
      {fieldsToShow.includes("colaborador") && (
        <Box sx={{ mt: 0 }}>
          <AutocompleteColaboradores
            value={colaboradorSeleccionado}
            onChange={value => {
              setColaboradorSeleccionado(value);
              setErrores(e => ({ ...e, colaborador: '' }));
            }}
            helperText={errores.colaborador || (colaboradorError ? "El colaborador ingresado no existe, por favor corrija." : undefined)}
          />
        </Box>
      )}
      {fieldsToShow.includes("empresa") && (
        <AutocompleteEmpresas
          value={empresaSeleccionada}
          onChange={value => {
            setEmpresaSeleccionada(value);
            setErrores(e => ({ ...e, empresa: '' }));
          }}
          helperText={errores.empresa || (empresaError ? "La empresa ingresada no existe, por favor corrija." : undefined)}
        />
      )}
      {fieldsToShow.includes("patenteCamion") && (
        <AutocompleteCamiones
          value={patenteCamionSeleccionada}
          onChange={value => {
            setPatenteCamionSeleccionada(value);
            setErrores(e => ({ ...e, camion: '' }));
          }}
          error={camionError}
          helperText={errores.camion || (camionError ? "La patente de camión ingresada no existe, por favor corrija." : undefined)}
        />
      )}
      {fieldsToShow.includes("patenteAcoplado") && (
        <AutocompleteAcoplados
          value={patenteAcopladoSeleccionada}
          onChange={value => {
            setPatenteAcopladoSeleccionada(value);
            setErrores(e => ({ ...e, acoplado: '' }));
          }}
          error={acopladoError}
          helperText={errores.acoplado || (acopladoError ? "La patente de acoplado ingresada no existe, por favor corrija." : undefined)}
        />
      )}
      {tieneBitren && fieldsToShow.includes("patenteAcopladoExtra") && (
        <AutocompleteAcoplados
          value={patenteAcopladoExtraSeleccionada}
          onChange={value => {
            setPatenteAcopladoExtraSeleccionada(value);
            setErrores(e => ({ ...e, acopladoExtra: '' }));
          }}
          error={acopladoExtraError}
          helperText={errores.acopladoExtra || (acopladoExtraError ? "La patente de acoplado extra ingresada no existe, por favor corrija." : undefined)}
          tituloOpcional="Patente Acoplado Extra"
        />
      )}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleClose}
          sx={{
            backgroundColor: theme.colores.azul,
            color: '#fff',
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': { backgroundColor: theme.colores.azul, opacity: 0.9 },
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: theme.colores.azul,
            color: '#fff',
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': { backgroundColor: theme.colores.azul, opacity: 0.9 },
          }}
        >
          Guardar Datos Principales
        </Button>
      </Box>
    </Box>
  );
};

export default TurnoConErroresForm;
