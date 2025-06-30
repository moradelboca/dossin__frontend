import React, { useEffect, useState, useContext } from "react";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";
import { ContextoGeneral } from "../../Contexto";
import dayjs from "dayjs";
import { CargasFechasMock } from "../CargasFechasMock";

interface DashboardFechasProps {
  selections: {
    provincias: string[];
  };
  chartHeight: number | string;
  startDate?: string;
  endDate?: string;
  dateRangeType?: string; // '1D', '5D', '1M', etc.
}

const DashboardFechas: React.FC<DashboardFechasProps> = ({ selections, chartHeight, startDate, endDate, dateRangeType }) => {
  const { dashboardURL } = useContext(ContextoGeneral);
  const [allData, setAllData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // Fetch all data once
  useEffect(() => {
    // Detectar si estamos en local
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isLocal) {
      setAllData(CargasFechasMock);
    } else {
      fetch(`${dashboardURL}/cargas`, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setAllData(data))
        .catch(() => setAllData([]));
    }
  }, [dashboardURL]);

  // Filtrar y agrupar según rango y provincias
  useEffect(() => {
    if (!allData.length || !selections.provincias.length) {
      setChartData([]);
      return;
    }
    // Filtrar por rango de fechas si están definidos
    let dataFiltrada = allData;
    if (startDate && endDate) {
      dataFiltrada = allData.filter(d => {
        return dayjs(d.fecha).isSameOrAfter(dayjs(startDate), 'day') && dayjs(d.fecha).isSameOrBefore(dayjs(endDate), 'day');
      });
    }
    // Ordenar datos por fecha ascendente
    const dataOrdenada = [...dataFiltrada].sort((a, b) => dayjs(a.fecha).diff(dayjs(b.fecha)));
    // Agrupación según rango
    let agrupados: any[] = [];
    switch (dateRangeType) {
      case '1D': {
        // Un punto por día (sin agrupar)
        const fechasUnicas = Array.from(new Set(dataOrdenada.map(d => d.fecha)));
        agrupados = fechasUnicas.map(fecha => {
          const entry: any = { fecha };
          selections.provincias.forEach(prov => {
            const suma = dataOrdenada
              .filter(d => d.fecha === fecha && (d.provincia === prov || d.provincia === normalizarProvincia(prov)))
              .reduce((acc, curr) => acc + (curr.cantidadTotal || 0), 0);
            entry[prov] = suma;
          });
          return entry;
        });
        break;
      }
      case '5D': {
        // Agrupar cada 5 días consecutivos
        const fechasUnicas = Array.from(new Set(dataOrdenada.map(d => d.fecha))).sort((a, b) => dayjs(a).diff(dayjs(b)));
        for (let i = 0; i < fechasUnicas.length; i += 5) {
          const bloque = fechasUnicas.slice(i, i + 5);
          const entry: any = { fecha: `${bloque[0]} - ${bloque[bloque.length - 1]}` };
          selections.provincias.forEach(prov => {
            const suma = dataOrdenada
              .filter(d => bloque.includes(d.fecha) && (d.provincia === prov || d.provincia === normalizarProvincia(prov)))
              .reduce((acc, curr) => acc + (curr.cantidadTotal || 0), 0);
            entry[prov] = suma;
          });
          agrupados.push(entry);
        }
        break;
      }
      case '1M': {
        // Agrupar por mes
        const meses = Array.from(new Set(dataOrdenada.map(d => dayjs(d.fecha).format('YYYY-MM'))));
        agrupados = meses.map(mes => {
          const entry: any = { fecha: mes };
          selections.provincias.forEach(prov => {
            const suma = dataOrdenada
              .filter(d => dayjs(d.fecha).format('YYYY-MM') === mes && (d.provincia === prov || d.provincia === normalizarProvincia(prov)))
              .reduce((acc, curr) => acc + (curr.cantidadTotal || 0), 0);
            entry[prov] = suma;
          });
          return entry;
        });
        break;
      }
      case '3M': {
        // Agrupar por trimestre
        const trimestres = Array.from(new Set(dataOrdenada.map(d => `${dayjs(d.fecha).year()}-T${Math.floor((dayjs(d.fecha).month())/3)+1}`)));
        agrupados = trimestres.map(trim => {
          const entry: any = { fecha: trim };
          selections.provincias.forEach(prov => {
            const suma = dataOrdenada
              .filter(d => `${dayjs(d.fecha).year()}-T${Math.floor((dayjs(d.fecha).month())/3)+1}` === trim && (d.provincia === prov || d.provincia === normalizarProvincia(prov)))
              .reduce((acc, curr) => acc + (curr.cantidadTotal || 0), 0);
            entry[prov] = suma;
          });
          return entry;
        });
        break;
      }
      case '6M': {
        // Agrupar por semestre
        const semestres = Array.from(new Set(dataOrdenada.map(d => `${dayjs(d.fecha).year()}-S${Math.floor((dayjs(d.fecha).month())/6)+1}`)));
        agrupados = semestres.map(sem => {
          const entry: any = { fecha: sem };
          selections.provincias.forEach(prov => {
            const suma = dataOrdenada
              .filter(d => `${dayjs(d.fecha).year()}-S${Math.floor((dayjs(d.fecha).month())/6)+1}` === sem && (d.provincia === prov || d.provincia === normalizarProvincia(prov)))
              .reduce((acc, curr) => acc + (curr.cantidadTotal || 0), 0);
            entry[prov] = suma;
          });
          return entry;
        });
        break;
      }
      case 'YTD': {
        // Agrupar por mes desde inicio de año
        const meses = Array.from(new Set(dataOrdenada.map(d => dayjs(d.fecha).format('YYYY-MM'))));
        agrupados = meses.map(mes => {
          const entry: any = { fecha: mes };
          selections.provincias.forEach(prov => {
            const suma = dataOrdenada
              .filter(d => dayjs(d.fecha).format('YYYY-MM') === mes && (d.provincia === prov || d.provincia === normalizarProvincia(prov)))
              .reduce((acc, curr) => acc + (curr.cantidadTotal || 0), 0);
            entry[prov] = suma;
          });
          return entry;
        });
        break;
      }
      case '1A': {
        // Agrupar por año
        const anios = Array.from(new Set(dataOrdenada.map(d => dayjs(d.fecha).format('YYYY'))));
        agrupados = anios.map(anio => {
          const entry: any = { fecha: anio };
          selections.provincias.forEach(prov => {
            const suma = dataOrdenada
              .filter(d => dayjs(d.fecha).format('YYYY') === anio && (d.provincia === prov || d.provincia === normalizarProvincia(prov)))
              .reduce((acc, curr) => acc + (curr.cantidadTotal || 0), 0);
            entry[prov] = suma;
          });
          return entry;
        });
        break;
      }
      case 'ALL':
      default: {
        // Un punto por día (sin agrupar)
        const fechasUnicas = Array.from(new Set(dataOrdenada.map(d => d.fecha)));
        agrupados = fechasUnicas.map(fecha => {
          const entry: any = { fecha };
          selections.provincias.forEach(prov => {
            const suma = dataOrdenada
              .filter(d => d.fecha === fecha && (d.provincia === prov || d.provincia === normalizarProvincia(prov)))
              .reduce((acc, curr) => acc + (curr.cantidadTotal || 0), 0);
            entry[prov] = suma;
          });
          return entry;
        });
        break;
      }
    }
    setChartData(agrupados);
  }, [allData, selections.provincias, dateRangeType, startDate, endDate]);

  // Normalizar nombres de provincia para comparar (ej: "Cordoba" vs "Córdoba")
  function normalizarProvincia(nombre: string) {
    return nombre.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  }

  // Paleta de colores para las líneas
  const colorPalette = [
    "#ff1493",
    "#ffd700",
    "#adff2f",
    "#ff8c00",
    "#e6e6fa",
    "#ff6347",
    "#ff4500",
    "#00ced1",
    "#32cd32",
    "#8a2be2",
  ];

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <XAxis dataKey="fecha" />
        <YAxis />
        <Tooltip />
        {selections.provincias.map((prov, index) => (
          <Line
            key={prov}
            type="monotone"
            dataKey={prov}
            stroke={colorPalette[index % colorPalette.length]}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DashboardFechas;
