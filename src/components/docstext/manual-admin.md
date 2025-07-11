# Manual de uso del sistema – Perfil ADMIN (Versión extendida y detallada)

Este manual es una guía exhaustiva para el uso del sistema como Administrador. Aquí encontrarás explicaciones profundas de cada pantalla, sección, flujo de trabajo, validaciones, advertencias, tips, ejemplos y particularidades. El objetivo es que cualquier usuario admin pueda operar el sistema con seguridad, eficiencia y conocimiento de todas las herramientas disponibles.

---

# Índice

1. [Dashboard (Inicio)](#dashboard-inicio)
2. [Cargas](#cargas)
3. [Cupos y Turnos](#cupos-y-turnos)
4. [Usuarios](#usuarios)
5. [Colaboradores](#colaboradores)
6. [Empresas](#empresas)
7. [Camiones y Acoplados](#camiones-y-acoplados)
8. [Inconvenientes](#inconvenientes)
9. [Ubicaciones](#ubicaciones)
10. [Contratos](#contratos)
11. [Clima](#clima)
12. [Calculadora](#calculadora)
13. [Permisos y advertencias](#permisos-y-advertencias)
14. [Consejos generales y buenas prácticas](#consejos-generales-y-buenas-practicas)

---

# Dashboard (Inicio)

La pantalla principal del sistema es el Dashboard. Aquí se resumen los indicadores clave de la operación y se accede rápidamente a información relevante para la gestión.

## Secciones principales
- **Filtros de fecha:** En la parte superior, podés elegir el rango de fechas para ver los datos (1 día, 5 días, 1 mes, 3 meses, 6 meses, año actual, 1 año, o todos). También podés seleccionar un rango personalizado con el calendario.
- **Tarjetas principales:**
  - Toneladas totales transportadas.
  - Tiempo promedio de asignación de carga.
  - Promedio de tarifa de transporte.
  - Cantidad de inconvenientes (con acceso rápido para ver detalles o agregar uno nuevo).
- **Tarjetas secundarias:**
  - CO2 emitido (en toneladas).
  - Tiempo promedio de resolución de inconvenientes.
  - Tiempo promedio de confirmación de carga.
  - Colaboradores nuevos (con acceso rápido para ver detalles).
- **Gráficos:**
  - Evolución de cargas y toneladas transportadas por fecha, tipo de cargamento y provincia.
  - Permiten filtrar por tipo de carga, provincia y fechas.

## Flujos y tips
- Usá los filtros para analizar la operación en distintos períodos.
- Hacé clic en los íconos de suma (+) en las tarjetas para ver detalles o agregar información.
- Los gráficos son interactivos y permiten comparar tendencias.
- Si ves valores inesperados, revisá los filtros aplicados.

## Errores y advertencias
- Si no se muestran datos, puede ser por falta de información en el rango seleccionado o problemas de conexión.
- Si un gráfico no carga, intentá refrescar la página.

---

# Cargas

La pantalla de Cargas es el centro de la gestión logística. Permite consultar, filtrar, editar y gestionar todas las cargas y sus etapas.

## Estructura de la pantalla
- **Panel lateral izquierdo:**
  - Lista de todas las cargas, con filtros por provincia, ID, tipo de cargamento, origen y destino.
  - Cada carga muestra título, origen, destino y fecha.
- **Panel principal:**
  - Al seleccionar una carga, se muestran todos sus detalles:
    - Recorrido en el mapa (origen, destino, balanza si corresponde).
    - Gestión de cupos (ver, agregar, editar, eliminar).
    - Horarios de cada etapa (balanza, carga, descarga).
    - Datos generales: tarifa, kilómetros, tipo de acoplado, notas.
    - Descripción y observaciones.

## Acciones principales
- **Ver detalles:** Hacé clic en una carga para ver su información completa.
- **Editar carga:** Ícono de lápiz. Permite modificar ubicaciones, horarios, kilómetros, tarifa, tipos de acoplado, descripción, tolerancia, etc.
- **Eliminar carga:** Ícono de basurita. El sistema pedirá confirmación. No se puede eliminar si la carga está asociada a datos críticos.
- **Filtrar cargas:** Usá los filtros para encontrar cargas específicas.

## Flujos de trabajo
- Para crear una carga, seguí el formulario guiado de 5 pasos (ubicaciones, kilómetros, tarifa, acoplados, información adicional).
- Para editar, seleccioná la carga y usá el lápiz en la sección correspondiente.
- Para ver los cupos de una carga, seleccioná la carga y accedé a la sección de cupos.

## Validaciones y advertencias
- No se puede guardar una carga sin completar los campos obligatorios.
- Revisá dependencias antes de eliminar una carga.
- Si un dato no aparece en los autocompletados, pedí a un admin que lo agregue.

## Tips
- Mantené actualizada la información de cada carga.
- Usá los filtros para trabajar más rápido.
- Revisá bien los datos antes de guardar cambios.

---

# Cupos y Turnos

La gestión de cupos y turnos es fundamental para organizar la logística de cada carga.

## Estructura y vistas
- **Acceso:** Desde Cargas > seleccioná una carga > Cupos.
- **Vistas disponibles:**
  - Cards (tarjetas): visualización rápida de cada cupo y sus turnos.
  - Grid (tabla): vista tabular con todos los datos de los turnos.
  - Por Día: seleccioná una fecha y visualizá todos los turnos de ese día.
- **Panel superior:**
  - Tabs para cambiar de vista.
  - Botón para crear un nuevo cupo.

## Acciones principales
- **Crear cupo:** Botón "Quiero crear un nuevo cupo". Completá el formulario y guardá.
- **Editar cupo:** En la tarjeta o tabla, hacé clic en "Ver más" o el lápiz.
- **Eliminar cupo:** Ícono de basurita. El sistema pedirá confirmación.
- **Crear turno:** En la tarjeta del cupo, botón "Crear turno".
- **Gestionar turnos:** Según el estado, podés corregir, validar, autorizar, cargar tara, cargar peso bruto, cargar carta de porte, cargar factura, pagar, etc.
- **Filtrar y exportar:** Usá los botones para aplicar filtros avanzados o exportar la lista.
- **Personalizar columnas:** Elegí qué datos ver en la tabla.

## Estados de los turnos
- Con Errores, Creado, Validado, Cancelado, Autorizado, Tarado, Cargado, En viaje, Descargado, Facturado, Pagado. Cada uno tiene color y acciones posibles.

## Validaciones y advertencias
- No se puede guardar un turno sin completar los campos obligatorios.
- El número de CTG debe ser único.
- Si no ves la opción de editar o eliminar, probablemente tu rol no tiene permiso.

## Tips
- Usá los filtros y la búsqueda para encontrar turnos rápidamente.
- Si un dato no aparece, pedí a un admin que lo agregue.
- Revisá bien los datos antes de guardar.

---

# Usuarios

La pantalla de Usuarios permite gestionar todas las cuentas del sistema.

## Estructura
- **Panel superior:**
  - Título "Usuarios".
  - Buscador para filtrar por email, nombre, apellido, etc.
  - Botón "+ AGREGAR USUARIO" para crear una cuenta.
  - Botones de filtros, exportar y personalizar columnas.
- **Tabla de usuarios:**
  - Columnas: Id, Email, Nombre, Apellido, Nombre de usuario, Imagen, Rol, Activo, Editar.
  - Ícono de lápiz para editar, basurita para eliminar, switch para activar/desactivar.
  - Paginación para navegar entre páginas.

## Acciones principales
- **Agregar usuario:** Completá el formulario con email, nombre, apellido, rol, etc. El sistema valida que el email no exista.
- **Editar usuario:** Ícono de lápiz. Modificá los datos y guardá.
- **Eliminar usuario:** Ícono de basurita. El sistema pedirá confirmación.
- **Activar/desactivar usuario:** Switch en la columna "Activo".
- **Buscar, filtrar, exportar, personalizar columnas.**

## Validaciones y advertencias
- Solo los roles con permiso pueden crear, editar o borrar usuarios.
- No se puede guardar un usuario sin email válido.
- Si no ves la opción de editar/eliminar, revisá tus permisos.

## Tips
- Mantené actualizada la información de los usuarios.
- Deshabilitá usuarios si no querés borrar su historial.
- Usá los filtros para encontrar rápido.

---

# Colaboradores

Permite gestionar choferes y encargados.

## Estructura
- **Panel superior:**
  - Título "Colaboradores".
  - Buscador para filtrar por nombre, apellido, CUIL, etc.
  - Botón "+ AGREGAR COLABORADOR".
  - Botones de filtros, exportar y personalizar columnas.
- **Tabla:**
  - Columnas: Cuil, Nombre, Número Celular, Apellido, URL Linti, Localidad, Cuit Empresas, Rol, Editar.
  - Ícono de lápiz para editar.
  - Paginación.

## Acciones principales
- Agregar, editar, eliminar colaboradores.
- Buscar, filtrar, exportar, personalizar columnas.

## Validaciones y advertencias
- No se puede guardar un colaborador con CUIL duplicado.
- Solo los roles con permiso pueden editar/eliminar.

## Tips
- Mantené los datos actualizados.
- Usá los filtros para encontrar rápido.

---

# Empresas

Permite gestionar todas las empresas registradas.

## Estructura
- **Panel superior:**
  - Título "Empresas".
  - Buscador para filtrar por nombre, CUIT, razón social, etc.
  - Botón "+ AGREGAR EMPRESA".
  - Botones de filtros, exportar y personalizar columnas.
- **Tabla:**
  - Columnas: CUIT, Razón Social, Nombre Fantasía, Localidad/Provincia, Número Celular, Roles, Editar.
  - Ícono de lápiz para editar.
  - Paginación.

## Acciones principales
- Agregar, editar, eliminar empresas.
- Buscar, filtrar, exportar, personalizar columnas.

## Validaciones y advertencias
- No se puede guardar una empresa con CUIT duplicado.
- No se puede eliminar una empresa asociada a cargas u otros datos.

## Tips
- Revisá dependencias antes de eliminar.
- Usá los filtros para encontrar rápido.

---

# Camiones y Acoplados

Permite gestionar la flota de vehículos.

## Estructura
- **Tabs superiores:** Camiones y Acoplados.
- **Panel superior:**
  - Buscador por patente.
  - Botón "+ AGREGAR CAMION" o "+ AGREGAR ACOPLADO".
  - Botones de filtros, exportar y personalizar columnas.
- **Tabla:**
  - Columnas: Patente, URL RTO, URL Póliza de Seguro, URL Ruta, Editar.
  - Ícono de lápiz para editar.
  - Paginación.

## Acciones principales
- Agregar, editar, eliminar camiones y acoplados.
- Buscar, filtrar, exportar, personalizar columnas.

## Validaciones y advertencias
- No se puede guardar un vehículo con patente duplicada.
- No se puede eliminar un vehículo asociado a cargas o turnos.

## Tips
- Mantené la documentación de cada vehículo actualizada.
- Usá los filtros para encontrar rápido.

---

# Inconvenientes

Permite reportar y gestionar problemas o incidencias.

## Estructura
- **Panel superior:**
  - Título "Inconvenientes".
  - Botón "+ AGREGAR INCONVENIENTE".
- **Tabla:**
  - Columnas: Nombre, Tipo, Estado, Urgencia, Fecha, Creado por, Asignado a, Acción.
  - Colores para estado y urgencia.
  - Ícono de flecha para expandir y ver la descripción completa.
  - Paginación.

## Acciones principales
- Agregar, editar, eliminar inconvenientes.
- Cambiar estado (pendiente, activo, resuelto).
- Asignar inconvenientes a usuarios.

## Validaciones y advertencias
- Solo los roles con permiso pueden editar/eliminar.
- Borrar o modificar un inconveniente puede afectar reportes y alertas.

## Tips
- Usá los filtros para encontrar los más urgentes.
- Revisá bien antes de eliminar un inconveniente crítico.

---

# Ubicaciones

Permite gestionar todos los puntos de carga, descarga y balanza en un mapa interactivo.

## Estructura
- **Controles superiores:**
  - Selector de tipo de ubicación (carga, descarga, balanza, etc.).
  - Buscador por nombre o tipo.
  - Botón para agregar ubicación.
  - Botón para centrar el mapa.
  - Botón para cambiar el tipo de mapa.
- **Mapa interactivo:**
  - Muestra todos los puntos como marcadores.
  - Al hacer clic en un marcador, se abre un diálogo con los detalles y acciones.

## Acciones principales
- Agregar, editar, eliminar ubicaciones.
- Buscar y filtrar ubicaciones.
- Ver detalles y editar desde el mapa.

## Validaciones y advertencias
- No se puede guardar una ubicación sin completar los campos obligatorios.
- No se puede eliminar una ubicación asociada a cargas u otros datos.

## Tips
- Usá el buscador y los filtros para encontrar ubicaciones rápido.
- Revisá dependencias antes de eliminar.

---

# Contratos

Permite gestionar contratos y sus cargas asociadas.

## Estructura
- **Lista de contratos:** Cada contrato se muestra como una tarjeta con:
  - Titular, destinatario, botones para crear carga y editar contrato.
  - Lista de cargas asociadas a la derecha.
- **Cargas del contrato:** Muestran origen, destino, kilómetros, tarifa, tipo de cargamento.

## Acciones principales
- Agregar, editar contratos.
- Crear cargas dentro de un contrato.
- Editar cargas asociadas.

## Validaciones y advertencias
- No se puede guardar un contrato sin los datos obligatorios.
- Al editar un contrato, las cargas asociadas se mantienen.

## Tips
- Creá primero el contrato y después las cargas.
- Podés tener varias cargas con diferentes destinos en un mismo contrato.

---

# Clima

Permite consultar el pronóstico del tiempo para diferentes ubicaciones.

## Estructura
- **Panel izquierdo:**
  - Buscador de ubicación.
  - Lista de ubicaciones frecuentes.
  - Checkbox para alternar entre pronóstico horario y diario.
- **Panel principal:**
  - Gráfico interactivo con temperatura, probabilidad de precipitación y precipitaciones.

## Acciones principales
- Buscar ubicación y ver pronóstico.
- Cambiar entre ubicaciones frecuentes.
- Alternar entre datos diarios y horarios.

## Validaciones y advertencias
- Si no ves datos, revisá la ortografía de la localidad o consultá con un admin.

## Tips
- Usá el pronóstico para planificar tareas de campo y logística.
- El gráfico es interactivo: pasá el mouse para ver valores exactos.

---

# Calculadora

Permite estimar tarifas y costos de transporte.

## Estructura
- **Formulario de cálculo:**
  - Kilómetros a recorrer, toneladas a transportar, precio del grano, porcentaje de descuento, contra flete.
  - Botón "Calcular tarifa".
- **Tabla de resultados:**
  - Tarifa por tonelada, tarifa total, tarifa con descuento, tarifa total con descuento, tarifa con contraflete, tarifa por km, incidencia, etc.

## Acciones principales
- Ingresar datos y calcular tarifa.
- Interpretar los resultados.

## Validaciones y advertencias
- No se puede calcular si faltan datos obligatorios.
- Los resultados son solo de referencia.

## Tips
- Probá diferentes escenarios cambiando los valores.
- Consultá con un supervisor si no entendés algún concepto.

---

# Permisos y advertencias

- El admin puede ver, crear, editar y borrar en todas las pantallas.
- Puede corregir turnos con error y cambiar el estado de los turnos.
- Puede asignar roles y permisos a otros usuarios.
- Si no ves una opción, revisá tus permisos.
- No borres datos críticos sin revisar dependencias.

---

# Consejos generales y buenas prácticas

- Usá los filtros y la búsqueda para trabajar más rápido.
- Consultá la sección de preguntas frecuentes en cada pantalla.
- Mantené los datos actualizados y revisá bien antes de guardar cambios.
- No compartas datos sensibles ni uses información privada en las capturas.
- Si tenés dudas, consultá con otro admin o supervisor.
- Ante errores, refrescá la página o contactá soporte.

---
2
# Anexos

## Imágenes ilustrativas

Colocá las imágenes en la carpeta `imagenes/` y referencialas en cada sección usando el formato:

```
![nombre-imagen.png](imagenes/nombre-imagen.png)
1. (Círculo 1) Explicación...
2. (Círculo 2) Explicación...
```

## Glosario
- **Cupo:** Espacio disponible para un turno de carga.
- **Turno:** Reserva para cargar o descargar mercadería.
- **Colaborador:** Persona que trabaja en la empresa (chofer, encargado, etc.).
- **Acoplado:** Vehículo que se engancha al camión.
- **CTG:** Código de Tránsito de Granos.
- **Tarifa:** Precio por tonelada o kilómetro.

---

Este manual se irá actualizando con nuevas funcionalidades y mejoras. Si encontrás errores o tenés sugerencias, comunicalo al equipo de soporte o administración. 