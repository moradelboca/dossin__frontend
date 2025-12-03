import React, { useContext, useState, useEffect } from "react";
import { ContextoGeneral } from "../../Contexto";
import {
  Radar,
  RadarChart,
  PolarGrid,
  Legend,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { CargamentoProvinciaPrueba } from "../CargamentoProvinciaPrueba";
import { axiosGet } from "../../../lib/axiosConfig";

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
  chartHeight: number | string;
}

// El mock se moverá a un archivo aparte para simular la información del endpoint en local.

const DashboardCargas: React.FC<DashboardCargasProps & { startDate?: string, endDate?: string, cargamentosSeleccionados?: number[] }> = ({ selections, chartHeight, startDate, endDate, cargamentosSeleccionados }) => {
  const { dashboardURL } = useContext(ContextoGeneral);
  const [fetchedData, setFetchedData] = useState<Cargas[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      let data;
      if (isLocal) {
        data = CargamentoProvinciaPrueba;
      } else {
        const params = new URLSearchParams();
        if (startDate) params.append('fechaDesde', startDate);
        if (endDate) params.append('fechaHasta', endDate);
        const queryString = params.toString();
        const url = queryString ? `cargas/cargamento-provincia?${queryString}` : 'cargas/cargamento-provincia';
        data = await axiosGet<any>(url, dashboardURL);
      }
      // Procesar data: [{ provincia, Maiz: 100, Trigo: 200, ... }, ...]
      // Necesitamos el mapping de id a nombre de cargamento
      const idToNombre: Record<number, string> = {};
      if (Array.isArray(selections.cargas) && Array.isArray(cargamentosSeleccionados)) {
        selections.cargas.forEach((nombre: string, idx: number) => {
          if (cargamentosSeleccionados[idx] !== undefined) {
            idToNombre[cargamentosSeleccionados[idx]] = nombre;
          }
        });
      }
      // Provincias únicas
      const provinciasSet = new Set<string>();
      data.datos.forEach((dia: any) => {
        dia.cargamentos.forEach((c: any) => {
          provinciasSet.add(c.provincia);
        });
      });
      // Solo mostrar las provincias seleccionadas
      const provincias = Array.isArray(selections.provincias) && selections.provincias.length > 0
        ? selections.provincias
        : Array.from(provinciasSet);
      // Construir estructura
      const chartData: any[] = provincias.map((provincia) => {
        const entry: any = { provincia };
        if (Array.isArray(cargamentosSeleccionados)) {
          cargamentosSeleccionados.forEach((tipoId: number) => {
            let total = 0;
            data.datos.forEach((dia: any) => {
              dia.cargamentos.forEach((c: any) => {
                if (c.provincia === provincia && c.tipo === tipoId) {
                  total += parseFloat(c.toneladas);
                }
              });
            });
            const nombre = idToNombre[tipoId] || `Tipo ${tipoId}`;
            entry[nombre] = total;
          });
        }
        return entry;
      });
      setFetchedData(chartData);
    };
    fetchData();
  }, [dashboardURL, startDate, endDate, cargamentosSeleccionados, selections.cargas, selections.provincias]);

  // Paleta de colores para cada radar
  const colorPalette = [
    "#ff1493", "#ffd700", "#adff2f", "#ff8c00", "#e6e6fa",
    "#ff6347", "#ff4500", "#00ced1", "#32cd32", "#8a2be2",
  ];

  // Nombres de los cargamentos seleccionados
  const nombresCargamentos = selections.cargas;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <RadarChart outerRadius={90} data={fetchedData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="provincia" />
        <PolarRadiusAxis />
        {nombresCargamentos.map((nombre, index) => (
          <Radar
            key={nombre}
            name={nombre}
            dataKey={nombre}
            stroke={colorPalette[index % colorPalette.length]}
            fill={colorPalette[index % colorPalette.length]}
            fillOpacity={0.6}
          />
        ))}
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default DashboardCargas;
