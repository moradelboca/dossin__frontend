# Documentación de Cambios: Sistema de Mermas y Calidad del Grano

## Resumen Ejecutivo

Se ha implementado un sistema completo para gestionar **parámetros de calidad del grano** y calcular **ajustes de mermas** automáticamente en los turnos de carga basándose en los límites contractuales configurados en los contratos comerciales.

Este sistema permite:
- Definir parámetros de calidad (humedad, cuerpos extraños, proteína, etc.)
- Configurar límites contractuales específicos por contrato
- Registrar mediciones de calidad en cada turno (en carga y descarga)
- Calcular automáticamente ajustes de precio (bonificaciones o penalizaciones) según las mediciones

---

## 1. Nuevas Entidades y Conceptos

### 1.1 Parámetros de Calidad (`ParametroCalidad`)

Son los diferentes aspectos que se miden para evaluar la calidad del grano. Ejemplos: Humedad, Cuerpos Extraños, Proteína, Materia Grasa, etc.

**Campos principales:**
- `id`: Identificador único
- `nombre`: Nombre del parámetro (ej: "Humedad")
- `unidadMedida`: Unidad de medida (ej: "%", "g/kg", "ppm")
- `valorMinimo`: Valor mínimo válido para mediciones
- `valorMaximo`: Valor máximo válido para mediciones
- `descripcion`: Descripción del parámetro
- `activo`: Indica si el parámetro está activo (soft delete)

### 1.2 Límites Contractuales (`LimiteContractual`)

Son las reglas específicas que se configuran para cada contrato comercial, definiendo qué valores de calidad son aceptables y qué ajustes aplicar cuando se exceden.

**Campos principales:**
- `id`: Identificador único
- `idContratoComercial`: ID del contrato al que pertenece
- `idParametroCalidad`: ID del parámetro de calidad
- `valorLimite`: Valor límite (ej: 14.0 para humedad máxima)
- `tipoLimite`: Tipo de límite - `"maximo"`, `"minimo"` o `"exacto"`
- `tipoCalculo`: Tipo de cálculo del ajuste - `"fijo"`, `"porcentual"` o `"escalonado"`
- `valorPenalizacion`: Valor de la penalización/bonificación
- `aplicaBonificacion`: `true` si es bonificación, `false` si es penalización
- `detalleCalculo`: JSON con configuración adicional (para cálculos escalonados)
- `activo`: Indica si el límite está activo

**Tipos de límite:**
- `maximo`: Se aplica ajuste si el valor medido es mayor al límite
- `minimo`: Se aplica ajuste si el valor medido es menor al límite
- `exacto`: Se aplica ajuste si el valor medido es diferente al límite

**Tipos de cálculo:**
- `fijo`: Ajuste de monto fijo (ej: $100)
- `porcentual`: Ajuste como porcentaje del precio base del flete
- `escalonado`: Ajuste variable según rangos de diferencia (ver ejemplo más abajo)

### 1.3 Mediciones de Parámetros (`MedicionParametro`)

Son los valores medidos de calidad del grano para un turno específico.

**Campos principales:**
- `id`: Identificador único
- `idTurnoCarga`: ID del turno de carga
- `idParametroCalidad`: ID del parámetro medido
- `valorMedido`: Valor numérico medido
- `etapaMedicion`: Etapa en que se realizó la medición - `"carga"` o `"descarga"`
- `fechaCreacion`: Fecha y hora de creación

---

## 2. Cambios en Endpoints Existentes

### 2.1 Endpoint: GET `/api/turnos/:id`

**Cambio:** Ahora incluye información de ajustes de mermas en la respuesta.

**Nueva estructura de respuesta:**

```json
{
  "id": "TC-2024-001234",
  "colaborador": { ... },
  "empresa": { ... },
  "carga": {
    "id": 1,
    "idContrato": 5,
    ...
  },
  "precios": {
    "montoNeto": "1000.00",
    "iva": "210.00",
    "montoBruto": "1210.00",
    "retencion": "50.00",
    "descuentoBruto": "0.00",
    "adelanto": "200.00",
    "ajustesMermas": {
      "montoTotal": "-70.00",
      "detalle": [
        {
          "idParametroCalidad": 1,
          "nombreParametro": "Humedad",
          "valorMedido": 15.1,
          "valorLimite": 14.0,
          "tipoLimite": "maximo",
          "diferencia": 1.1,
          "tipoCalculo": "porcentual",
          "valorPenalizacion": 2.5,
          "montoAjuste": -25.00,
          "tipoAjuste": "descuento",
          "metodologia": "2.5% del precio base ($1000)",
          "etapaMedicion": "descarga"
        },
        {
          "idParametroCalidad": 2,
          "nombreParametro": "Cuerpos Extraños",
          "valorMedido": 2.8,
          "valorLimite": 2.0,
          "tipoLimite": "maximo",
          "diferencia": 0.8,
          "tipoCalculo": "escalonado",
          "valorPenalizacion": null,
          "montoAjuste": -45.00,
          "tipoAjuste": "descuento",
          "metodologia": "Escalón 0.5-1.0: 2.5% del precio base ($1000)",
          "etapaMedicion": "descarga"
        }
      ],
      "mensaje": "Se aplicaron 2 ajuste(s) de mermas"
    },
    "totalAPagar": "890.00"
  }
}
```

**Nota importante:** 

⚠️ **Estado actual:** El endpoint `GET /api/turnos/:id` actualmente retorna el turno usando `toJSON()`, que **NO incluye los ajustes de mermas** en el campo `precios`. El campo `precios` solo contiene el cálculo básico sin mermas.

**Para obtener precios con mermas:**

La entidad `TurnoDeCarga` tiene un método asíncrono `toSmallJSONConMermas()` que calcula los ajustes de mermas dinámicamente. Sin embargo, este método **no se está usando actualmente en el controlador**.

**Opciones para el frontend:**

1. **Opción recomendada:** Modificar el controlador para usar `toSmallJSONConMermas()` cuando se necesiten las mermas, o crear un endpoint específico como `GET /api/turnos/:id/con-mermas`.

2. **Opción alternativa:** Calcular las mermas en el frontend llamando a:
   - `GET /api/turnos/:idTurno/mediciones` para obtener las mediciones
   - `GET /api/contratos-comerciales/:idContrato/limites` para obtener los límites
   - Calcular los ajustes manualmente (no recomendado, mejor hacerlo en backend)

**Estructura esperada cuando se implemente:**

Cuando el endpoint incluya mermas, el campo `precios` tendrá esta estructura:

---

## 3. Nuevos Endpoints

### 3.1 Parámetros de Calidad

**Base URL:** `/api/parametros-calidad`

#### GET `/api/parametros-calidad`
Obtiene todos los parámetros de calidad activos.

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Humedad",
    "unidadMedida": "%",
    "valorMinimo": 0,
    "valorMaximo": 25,
    "descripcion": "Porcentaje de humedad del grano",
    "activo": true,
    "fechaCreacion": "2024-01-15T10:00:00Z",
    "fechaActualizacion": "2024-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "nombre": "Cuerpos Extraños",
    "unidadMedida": "%",
    "valorMinimo": 0,
    "valorMaximo": 5,
    "descripcion": "Porcentaje de cuerpos extraños en el grano",
    "activo": true,
    "fechaCreacion": "2024-01-15T10:05:00Z",
    "fechaActualizacion": "2024-01-15T10:05:00Z"
  }
]
```

#### POST `/api/parametros-calidad`
Crea un nuevo parámetro de calidad.

**Body:**
```json
{
  "nombre": "Proteína",
  "unidadMedida": "%",
  "valorMinimo": 8,
  "valorMaximo": 15,
  "descripcion": "Contenido proteico del grano"
}
```

**Respuesta:** El parámetro creado con su ID asignado.

#### PUT `/api/parametros-calidad/:id`
Actualiza un parámetro de calidad existente.

**Body (campos opcionales):**
```json
{
  "nombre": "Proteína Actualizada",
  "valorMaximo": 16
}
```

#### DELETE `/api/parametros-calidad/:id`
Elimina (soft delete) un parámetro de calidad.

---

### 3.2 Límites Contractuales

**Base URL:** `/api/contratos-comerciales/:idContrato/limites`

**Nota:** Estas rutas están registradas bajo `/api/contratos-comerciales`, por lo que la URL completa será `/api/contratos-comerciales/:idContrato/limites`.

#### GET `/api/contratos-comerciales/:idContrato/limites`
Obtiene todos los límites contractuales activos de un contrato.

**Respuesta:**
```json
[
  {
    "id": 1,
    "idContratoComercial": 5,
    "idParametroCalidad": 1,
    "parametroCalidad": {
      "id": 1,
      "nombre": "Humedad",
      "unidadMedida": "%"
    },
    "valorLimite": 14.0,
    "tipoLimite": "maximo",
    "tipoCalculo": "porcentual",
    "valorPenalizacion": 2.5,
    "aplicaBonificacion": false,
    "detalleCalculo": null,
    "activo": true,
    "observaciones": "Límite estándar para humedad",
    "fechaCreacion": "2024-01-20T10:00:00Z",
    "fechaActualizacion": "2024-01-20T10:00:00Z"
  }
]
```

#### GET `/api/contratos-comerciales/:idContrato/limites/todos`
Obtiene todos los límites (activos e inactivos) de un contrato.

#### POST `/api/contratos-comerciales/:idContrato/limites`
Configura múltiples límites para un contrato. **Reemplaza los límites existentes activos.**

**Body:**
```json
{
  "limites": [
    {
      "idParametroCalidad": 1,
      "valorLimite": 14.0,
      "tipoLimite": "maximo",
      "tipoCalculo": "porcentual",
      "valorPenalizacion": 2.5,
      "aplicaBonificacion": false,
      "detalleCalculo": null,
      "observaciones": "Límite estándar"
    },
    {
      "idParametroCalidad": 2,
      "valorLimite": 2.0,
      "tipoLimite": "maximo",
      "tipoCalculo": "escalonado",
      "valorPenalizacion": null,
      "aplicaBonificacion": false,
      "detalleCalculo": "[\n  {\"desde\": 0.0, \"hasta\": 0.5, \"valor\": 1.0, \"esPorcentual\": true},\n  {\"desde\": 0.5, \"hasta\": 1.0, \"valor\": 2.5, \"esPorcentual\": true},\n  {\"desde\": 1.0, \"hasta\": 999, \"valor\": 5.0, \"esPorcentual\": true}\n]",
      "observaciones": "Escalones para cuerpos extraños"
    }
  ]
}
```

**Ejemplo de detalleCalculo para escalonado:**
```json
[
  {
    "desde": 0.0,
    "hasta": 0.5,
    "valor": 1.0,
    "esPorcentual": true
  },
  {
    "desde": 0.5,
    "hasta": 1.0,
    "valor": 2.5,
    "esPorcentual": true
  },
  {
    "desde": 1.0,
    "hasta": 999,
    "valor": 5.0,
    "esPorcentual": true
  }
]
```

Este ejemplo significa:
- Si la diferencia está entre 0.0% y 0.5%: aplicar 1% del precio base
- Si la diferencia está entre 0.5% y 1.0%: aplicar 2.5% del precio base
- Si la diferencia es mayor a 1.0%: aplicar 5% del precio base

#### POST `/api/contratos-comerciales/:idContrato/limites/individual`
Crea un límite individual sin reemplazar los existentes.

**Body:**
```json
{
  "idParametroCalidad": 1,
  "valorLimite": 14.0,
  "tipoLimite": "maximo",
  "tipoCalculo": "porcentual",
  "valorPenalizacion": 2.5,
  "aplicaBonificacion": false
}
```

#### GET `/api/contratos-comerciales/:idContrato/limites/:idLimite`
Obtiene un límite específico por su ID.

#### PUT `/api/contratos-comerciales/:idContrato/limites/:idLimite`
Actualiza un límite específico.

**Body (campos opcionales):**
```json
{
  "valorLimite": 13.5,
  "valorPenalizacion": 3.0
}
```

#### DELETE `/api/contratos-comerciales/:idContrato/limites/:idLimite`
Elimina (soft delete) un límite específico.

---

### 3.3 Mediciones de Parámetros

**Base URL:** `/api/turnos/:idTurno/mediciones`

#### GET `/api/turnos/:idTurno/mediciones`
Obtiene todas las mediciones de un turno.

**Query params opcionales:**
- `etapa`: Filtrar por etapa (`"carga"` o `"descarga"`)

**Ejemplo:** `GET /api/turnos/TC-2024-001234/mediciones?etapa=descarga`

**Respuesta:**
```json
[
  {
    "id": 1,
    "idTurnoCarga": "TC-2024-001234",
    "idParametroCalidad": 1,
    "parametroCalidad": {
      "id": 1,
      "nombre": "Humedad",
      "unidadMedida": "%",
      "valorMinimo": 0,
      "valorMaximo": 25
    },
    "valorMedido": 15.1,
    "etapaMedicion": "descarga",
    "fechaCreacion": "2024-01-25T14:30:00Z"
  },
  {
    "id": 2,
    "idTurnoCarga": "TC-2024-001234",
    "idParametroCalidad": 2,
    "parametroCalidad": {
      "id": 2,
      "nombre": "Cuerpos Extraños",
      "unidadMedida": "%",
      "valorMinimo": 0,
      "valorMaximo": 5
    },
    "valorMedido": 2.8,
    "etapaMedicion": "descarga",
    "fechaCreacion": "2024-01-25T14:35:00Z"
  }
]
```

#### POST `/api/turnos/:idTurno/mediciones`
Registra una nueva medición para un turno.

**Body:**
```json
{
  "idParametroCalidad": 1,
  "valorMedido": 15.1,
  "etapaMedicion": "descarga"
}
```

**Validaciones:**
- `idParametroCalidad`, `valorMedido` y `etapaMedicion` son requeridos
- `etapaMedicion` debe ser `"carga"` o `"descarga"`
- No se pueden duplicar mediciones del mismo parámetro en la misma etapa

#### POST `/api/turnos/:idTurno/mediciones/lote`
Registra múltiples mediciones en lote para un turno.

**Body:**
```json
{
  "etapaMedicion": "descarga",
  "mediciones": [
    {
      "idParametroCalidad": 1,
      "valorMedido": 15.1
    },
    {
      "idParametroCalidad": 2,
      "valorMedido": 2.8
    }
  ]
}
```

**Ventaja:** Permite registrar varias mediciones de una vez, todas con la misma etapa.

#### GET `/api/turnos/:idTurno/mediciones/:idMedicion`
Obtiene una medición específica por su ID.

#### PUT `/api/turnos/:idTurno/mediciones/:idMedicion`
Actualiza una medición existente.

**Body (campos opcionales):**
```json
{
  "valorMedido": 14.9
}
```

#### DELETE `/api/turnos/:idTurno/mediciones/:idMedicion`
Elimina una medición específica.

#### DELETE `/api/turnos/:idTurno/mediciones`
Elimina todas las mediciones de un turno.

**Respuesta:**
```json
{
  "mensaje": "Se eliminaron 3 mediciones del turno TC-2024-001234",
  "numeroEliminadas": 3
}
```

---

## 4. Flujo de Trabajo Recomendado

### 4.1 Configuración Inicial (Administrador)

1. **Crear parámetros de calidad:**
   ```
   POST /api/parametros-calidad
   ```
   Crear todos los parámetros que se van a medir (Humedad, Cuerpos Extraños, etc.)

2. **Configurar límites en contratos:**
   ```
   POST /api/contratos-comerciales/:idContrato/limites
   ```
   Para cada contrato comercial, configurar los límites de calidad y sus ajustes correspondientes.

### 4.2 Operación Diaria (Usuario)

1. **Registrar mediciones en un turno:**
   ```
   POST /api/turnos/:idTurno/mediciones/lote
   ```
   Al registrar las mediciones de calidad del grano (en carga o descarga).

2. **Consultar turno con ajustes calculados:**
   ```
   GET /api/turnos/:idTurno
   ```
   El sistema calculará automáticamente los ajustes de mermas basándose en:
   - Las mediciones registradas
   - Los límites contractuales del contrato asociado
   - El precio base del flete

### 4.3 Visualización en Frontend

**Pantalla de Detalle de Turno:**
- Mostrar sección de "Mediciones de Calidad" con todas las mediciones registradas
- Mostrar sección de "Ajustes de Mermas" con el detalle de cada ajuste aplicado
- Mostrar el `totalAPagar` que ya incluye los ajustes de mermas

**Pantalla de Configuración de Contrato:**
- Mostrar sección de "Límites de Calidad" con todos los límites configurados
- Permitir crear/editar/eliminar límites
- Mostrar el tipo de cálculo y los valores de penalización/bonificación

---

## 5. Ejemplos de Cálculo de Ajustes

### Ejemplo 1: Cálculo Fijo

**Configuración:**
- Parámetro: Humedad
- Límite máximo: 14.0%
- Tipo de cálculo: Fijo
- Valor penalización: $100
- Aplica bonificación: false

**Medición:**
- Valor medido: 15.5%

**Resultado:**
- Diferencia: 1.5% (excede el límite)
- Ajuste aplicado: -$100 (descuento fijo)

### Ejemplo 2: Cálculo Porcentual

**Configuración:**
- Parámetro: Humedad
- Límite máximo: 14.0%
- Tipo de cálculo: Porcentual
- Valor penalización: 2.5%
- Aplica bonificación: false
- Precio base del flete: $1000

**Medición:**
- Valor medido: 15.1%

**Resultado:**
- Diferencia: 1.1% (excede el límite)
- Ajuste aplicado: -$25 (2.5% de $1000)

### Ejemplo 3: Cálculo Escalonado

**Configuración:**
- Parámetro: Cuerpos Extraños
- Límite máximo: 2.0%
- Tipo de cálculo: Escalonado
- Escalones:
  - 0.0% - 0.5% exceso: 1% del precio base
  - 0.5% - 1.0% exceso: 2.5% del precio base
  - >1.0% exceso: 5% del precio base
- Precio base del flete: $1000

**Medición:**
- Valor medido: 2.8%

**Resultado:**
- Diferencia: 0.8% (excede el límite)
- Escalón aplicado: 0.5% - 1.0% (2.5% del precio base)
- Ajuste aplicado: -$25 (2.5% de $1000)

---

## 6. Consideraciones Importantes

### 6.1 Cálculo Automático

Los ajustes de mermas se calculan **automáticamente** cuando:
- Se llama al método `toSmallJSONConMermas()` de la entidad TurnoDeCarga (método asíncrono)
- Se llama al método `calcularPrecioFinalConMermas()` de la entidad TurnoDeCarga (método asíncrono)

**⚠️ Estado actual:** El endpoint `GET /api/turnos/:id` **NO incluye mermas automáticamente** porque usa `toJSON()` que no calcula mermas. 

**El cálculo se hace en tiempo real** basándose en:
1. Las mediciones registradas en el turno
2. Los límites contractuales del contrato asociado a la carga
3. El precio base del flete

**Recomendación:** Modificar el controlador `obtenerTurnoDeCarga` para usar `toSmallJSONConMermas()` o crear un endpoint específico para obtener turnos con mermas calculadas.

### 6.2 Validaciones

- **Mediciones:** No se pueden duplicar mediciones del mismo parámetro en la misma etapa para un turno
- **Límites:** Cada contrato puede tener un límite activo por parámetro de calidad
- **Valores:** Los valores medidos deben estar dentro del rango válido del parámetro (`valorMinimo` - `valorMaximo`)

### 6.3 Estados y Soft Delete

- Los parámetros de calidad y límites contractuales usan soft delete (`activo: false`)
- Solo los límites activos se consideran para el cálculo de ajustes
- Las mediciones se eliminan físicamente (no hay soft delete)

### 6.4 Etapas de Medición

Las mediciones pueden registrarse en dos etapas:
- **`carga`**: Mediciones tomadas al momento de cargar el grano
- **`descarga`**: Mediciones tomadas al momento de descargar el grano

El sistema calcula los ajustes basándose en todas las mediciones del turno, independientemente de la etapa.

---

## 7. Posibles Mejoras Futuras

- Endpoint para recalcular mermas manualmente: `POST /api/turnos/:idTurno/recalcular-mermas`
- Reportes de mermas por contrato o período
- Historial de cambios en límites contractuales
- Validación automática de valores medidos contra rangos del parámetro

---

## 8. Resumen de Endpoints

### Parámetros de Calidad
- `GET /api/parametros-calidad` - Listar parámetros activos
- `POST /api/parametros-calidad` - Crear parámetro
- `PUT /api/parametros-calidad/:id` - Actualizar parámetro
- `DELETE /api/parametros-calidad/:id` - Eliminar parámetro

### Límites Contractuales
- `GET /api/contratos-comerciales/:idContrato/limites` - Listar límites activos
- `GET /api/contratos-comerciales/:idContrato/limites/todos` - Listar todos los límites
- `POST /api/contratos-comerciales/:idContrato/limites` - Configurar límites (reemplaza existentes)
- `POST /api/contratos-comerciales/:idContrato/limites/individual` - Crear límite individual
- `GET /api/contratos-comerciales/:idContrato/limites/:idLimite` - Obtener límite específico
- `PUT /api/contratos-comerciales/:idContrato/limites/:idLimite` - Actualizar límite
- `DELETE /api/contratos-comerciales/:idContrato/limites/:idLimite` - Eliminar límite

### Mediciones de Parámetros
- `GET /api/turnos/:idTurno/mediciones` - Listar mediciones (con filtro opcional por etapa)
- `POST /api/turnos/:idTurno/mediciones` - Registrar medición individual
- `POST /api/turnos/:idTurno/mediciones/lote` - Registrar mediciones en lote
- `GET /api/turnos/:idTurno/mediciones/:idMedicion` - Obtener medición específica
- `PUT /api/turnos/:idTurno/mediciones/:idMedicion` - Actualizar medición
- `DELETE /api/turnos/:idTurno/mediciones/:idMedicion` - Eliminar medición
- `DELETE /api/turnos/:idTurno/mediciones` - Eliminar todas las mediciones del turno

### Turnos (Modificado)
- `GET /api/turnos/:id` - Ahora incluye `ajustesMermas` en `precios`

---

## Contacto y Soporte

Para dudas o consultas sobre la implementación, contactar al equipo de backend.

