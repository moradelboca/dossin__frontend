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
}

const TurnoConErroresForm: React.FC<TurnoConErroresFormProps> = ({
  seleccionado,
  datos,
  setDatos,
  handleClose,
  idCarga,
}) => {
  const { backendURL, theme } = useContext(ContextoGeneral);

  // Estado para saber si se requiere el bitren
  const [tieneBitren, setTieneBitren] = useState<boolean | null>(null);

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
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState<any | null>(
    seleccionado?.cuilColaborador || null
  );
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<any | null>(
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

  const handleSubmit = async () => {
    const payload = {
      idEstado: 3,
      cuilColaborador: colaboradorSeleccionado,
      cuitEmpresa: empresaSeleccionada,
      patenteCamion: patenteCamionSeleccionada,
      patenteAcoplado: patenteAcopladoSeleccionada,
      patenteAcopladoExtra: patenteAcopladoExtraSeleccionada || null,
    };

    try {
      const response = await fetch(`${backendURL}/turnos/errores/${seleccionado.id}`, {
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {fieldsToShow.includes("colaborador") && (
        <AutocompleteColaboradores
          value={colaboradorSeleccionado}
          onChange={setColaboradorSeleccionado}
        />
      )}
      {fieldsToShow.includes("empresa") && (
        <AutocompleteEmpresas
          value={empresaSeleccionada}
          onChange={setEmpresaSeleccionada}
        />
      )}
      {fieldsToShow.includes("patenteCamion") && (
        <AutocompleteCamiones
          value={patenteCamionSeleccionada}
          onChange={setPatenteCamionSeleccionada}
        />
      )}
      {fieldsToShow.includes("patenteAcoplado") && (
        <AutocompleteAcoplados
          value={patenteAcopladoSeleccionada}
          onChange={setPatenteAcopladoSeleccionada}
        />
      )}
      {tieneBitren && fieldsToShow.includes("patenteAcopladoExtra") && (
        <AutocompleteAcoplados
          value={patenteAcopladoExtraSeleccionada}
          onChange={setPatenteAcopladoExtraSeleccionada}
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
