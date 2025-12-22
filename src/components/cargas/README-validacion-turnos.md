# Análisis de Descargas - Validación de Turnos

## Funcionalidad

El componente `AnalisisDescargas` ahora incluye la capacidad de validar CTGs del CSV cargado contra el backend de Dossin para encontrar turnos en estado "en_viaje".

## Flujo de Trabajo

1. **Cargar CSV**: El usuario selecciona un proveedor (Bunge o AGD) y carga un archivo CSV
2. **Procesar Datos**: El sistema parsea el CSV y muestra métricas básicas
3. **Validar Turnos**: Al hacer clic en "Validar Turnos", el sistema:
   - Extrae CTGs únicos del CSV
   - Los procesa en lotes de 10
   - Consulta `${backendURL}/turnos?estado=en%20viaje&ctg={CTG}` para cada CTG
   - Espera 1 segundo entre lotes para no sobrecargar el sistema
   - Muestra progreso en tiempo real
4. **Mostrar Resultados**: Los turnos encontrados se muestran en una tabla con información detallada

## Configuración

- **Tamaño de lote**: 10 CTGs por lote (configurable en `VALIDATION_CONFIG.BATCH_SIZE`)
- **Delay entre lotes**: 1000ms (configurable en `VALIDATION_CONFIG.BATCH_DELAY_MS`)
- **Endpoint**: `${backendURL}/turnos?estado=en%20viaje&ctg={CTG}`

## Estados de la UI

- **Botón "Validar Turnos"**: Se deshabilita durante la validación y muestra spinner
- **Barra de progreso**: Muestra el porcentaje completado por lotes
- **Mensajes de error**: Alertas para errores de validación o falta de resultados
- **Tabla de resultados**: Muestra turnos encontrados con información detallada

## Manejo de Errores

- Errores individuales por CTG no interrumpen el proceso
- Se muestran mensajes informativos si no se encuentran resultados
- Errores de red se capturan y muestran al usuario

## Archivos Modificados

- `src/components/cargas/AnalisisDescargas.tsx`: Componente principal
- `src/utils/descargas/validation.ts`: Utilidades para chunking y normalización
- `src/utils/descargas/validation.test.ts`: Tests unitarios
- `src/types/descargas.ts`: Tipos ya existentes (no modificados)
- `src/utils/descargas/parsers.ts`: Parser ya existente (no modificados)

## Consideraciones Técnicas

- Usa `backendURL` del contexto para diferentes ambientes
- Normaliza diferentes formatos de respuesta del API
- Procesamiento en paralelo dentro de cada lote
- Pausa configurable entre lotes para evitar sobrecarga
- Tema azul consistente en toda la interfaz







