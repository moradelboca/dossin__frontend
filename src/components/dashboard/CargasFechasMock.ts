// Mock de cargas para el gráfico de fechas (DashboardFechas)
// Formato: { provincia: string, fecha: string, cantidadTotal: number }

import dayjs from "dayjs";

// Generar datos para 30 días y 5 provincias
const provincias = ["BsAs", "Cordoba", "Santa Fe", "San Luis", "Santiago del Estero"];
const start = dayjs("2025-05-01");
const dias = 365 * 2; // 2 años

interface CargaFechaMock {
  provincia: string;
  fecha: string;
  cantidadTotal: number;
}

export const CargasFechasMock: CargaFechaMock[] = [];
for (let i = 0; i < dias; i++) {
  const fecha = start.add(i, 'day').format('YYYY-MM-DD');
  provincias.forEach((prov, idx) => {
    CargasFechasMock.push({
      provincia: prov,
      fecha,
      cantidadTotal: Math.floor(Math.random() * 5) + 1 + idx // valores variados
    });
  });
} 