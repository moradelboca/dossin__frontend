import React, { useContext, useState, useEffect } from "react";
import { ContextoGeneral } from "../../Contexto";
import { CircularProgress, Box, Alert } from "@mui/material";
import {
  Radar,
  RadarChart,
  PolarGrid,
  Legend,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

// Definición del tipo para los datos de cargas
type Cargas = {
  provincia: string;
  [key: string]: number | string | undefined;
};

interface DashboardCargasProps {
  selections: {
    cargas: string[];
    provincias: string[];
  };
}


const DashboardCargas: React.FC<DashboardCargasProps> = ({ selections }) => {
  const { dashboardURL } = useContext(ContextoGeneral);
  const [fetchedData, setFetchedData] = useState<Cargas[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para realizar fetch según cada tipo de carga seleccionado
  const fetchCargasData = async () => {
    const cargaTypes = selections.cargas;
    const headers = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    };
    try {
      const results = await Promise.all(
        cargaTypes.map(async (carga) => {
          console.log(carga);
          const endpoint =
            carga === "General"
              ? `${dashboardURL}/turnos/provincia`
              : `${dashboardURL}/turnos/provincia/${encodeURIComponent(carga)}`;
          try {
            const res = await fetch(endpoint, { headers });
            if (!res.ok) {
              throw new Error(`Error en la petición para ${carga}`);
            }
            const data = await res.json();
            // Normalizamos la data para asegurarnos de que sea un arreglo
            const normalizedData = Array.isArray(data) ? data : [data];
            const result: Record<string, number> = {};
            normalizedData.forEach((item: any) => {
              if (item && typeof item === "object") {
                Object.keys(item).forEach((prov) => {
                  // Filtramos solo las provincias seleccionadas
                  if (
                    selections.provincias.includes(prov) &&
                    item[prov] &&
                    item[prov].Cantidad !== undefined
                  ) {
                    result[prov] = item[prov].Cantidad;
                  }
                });
              }
            });
            return { carga, result };
          } catch (err) {
            console.error(`Error en fetch para ${carga}:`, err);
            return { carga, result: {} };
          }
        })
      );

      // Combinar los resultados obtenidos
      const combined: Record<string, any> = {};
      results.forEach(({ carga, result }) => {
        Object.entries(result).forEach(([prov, cantidad]) => {
          if (selections.provincias.includes(prov)) {
            if (!combined[prov]) {
              combined[prov] = { provincia: prov };
            }
            combined[prov][carga] = cantidad;
          }
        });
      });
      setFetchedData(Object.values(combined));
      setLoading(false);
    } catch (err) {
      console.error("Error al combinar los datos:", err);
      setError("Error al cargar los datos");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selections.cargas.length > 0 && selections.provincias.length > 0) {
      setLoading(true);
      setError(null);
      fetchCargasData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections.cargas, selections.provincias, dashboardURL]);

  // Paleta de colores para cada radar
  const colorPalette = [
    "#ff1493", "#ffd700", "#adff2f", "#ff8c00", "#e6e6fa",
    "#ff6347", "#ff4500", "#00ced1", "#32cd32", "#8a2be2",
  ];

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        selections.cargas.length > 0 &&
        selections.provincias.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={fetchedData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="provincia" />
              <PolarRadiusAxis />
              {selections.cargas.map((item, index) => (
                <Radar
                  key={item}
                  name={item}
                  dataKey={item}
                  stroke={colorPalette[index % colorPalette.length]}
                  fill={colorPalette[index % colorPalette.length]}
                  fillOpacity={0.6}
                />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )
      )}
    </>
  );
};

export default DashboardCargas;
