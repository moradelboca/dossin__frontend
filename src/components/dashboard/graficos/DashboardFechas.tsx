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

interface DashboardFechasProps {
  selections: {
    fechas: string[]; // en formato "YYYY-MM-DD"
    provincias: string[]; // puede incluir "General" o nombres específicos
  };
}

const DashboardFechas: React.FC<DashboardFechasProps> = ({ selections }) => {
  const { dashboardURL } = useContext(ContextoGeneral);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Si no hay fechas o provincias seleccionadas no hacemos nada.
    if (selections.fechas.length === 0 || selections.provincias.length === 0) {
      setChartData([]);
      return;
    }

    async function fetchData() {
      try {
        // Definición de los headers para el fetch
        const fetchOptions = {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        };
    
        // Para cada fecha se llama al endpoint y se construye un objeto con la data.
        const responses = await Promise.all(
          selections.fechas.map(async (fecha) => {
            const res = await fetch(
              `${dashboardURL}/turnos/fecha/provincia/${fecha}`,
              fetchOptions
            );
            const data: Record<string, any> = await res.json();
            return { fecha, data };
          })
        );
    
        // Se arma la data para el gráfico: cada objeto tendrá la fecha y, para cada provincia seleccionada,
        // el valor de toneladas (convertido a número)
        const dataChart = responses.map(({ fecha, data }) => {
          const entry: any = { fecha };
          selections.provincias.forEach((prov) => {
            if (prov === "General") {
              // Sumar todas las toneladas de cada provincia
              let total = 0;
              Object.values(data).forEach((provData: any) => {
                let toneladasStr = "";
                // Si Toneladas es un objeto, extraer el valor de la propiedad "Toneladas"
                if (
                  typeof provData.Toneladas === "object" &&
                  provData.Toneladas !== null
                ) {
                  toneladasStr = provData.Toneladas.Toneladas;
                } else {
                  toneladasStr = provData.Toneladas;
                }
                // Remover la "t" (puedes ajustar la expresión regular si hay espacios u otros caracteres)
                const ton = parseFloat(toneladasStr.replace(/t/gi, "").trim());
                total += ton;
              });
              entry[prov] = total;
            } else {
              if (data[prov]) {
                let toneladasStr = "";
                if (
                  typeof data[prov].Toneladas === "object" &&
                  data[prov].Toneladas !== null
                ) {
                  toneladasStr = data[prov].Toneladas.Toneladas;
                } else {
                  toneladasStr = data[prov].Toneladas;
                }
                entry[prov] = parseFloat(
                  toneladasStr.replace(/t/gi, "").trim()
                );
              } else {
                entry[prov] = 0;
              }
            }
          });
          return entry;
        });
    
        setChartData(dataChart);
      } catch (error) {
        console.error("Error al obtener la data:", error);
      }
    }
    

    fetchData();
  }, [selections.fechas, selections.provincias, dashboardURL]);

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
    <ResponsiveContainer width="100%" height={400}>
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
