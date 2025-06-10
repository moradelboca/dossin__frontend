# Acciones sobre una Carga: Crear, Editar y Borrar

Este archivo explica **todas las acciones principales que se pueden realizar sobre una carga**: cómo crearla, cómo editarla y cómo borrarla. El proceso es guiado y utiliza el mismo formulario paso a paso (stepper) para crear y editar.

---

## Crear o Editar una Carga

El proceso de **crear** y **editar** una carga es guiado y utiliza el mismo formulario paso a paso (stepper). La única diferencia es que, al editar, los campos ya aparecen completados con los datos existentes y podés modificarlos según necesidad.

### ¿Cómo funciona el proceso?

El formulario tiene 5 pasos. En cada uno, el sistema valida que completes correctamente los datos antes de dejarte avanzar. A continuación se explica **qué hacer, qué opciones hay y consejos útiles en cada paso**.

---

### Paso 1: Seleccionar ubicación y horarios

**¿Qué hacer?**
- Seleccioná la **ubicación de carga** usando el autocompletado. Si la ubicación que necesitás no existe, podés crearla ahí mismo haciendo click en "Agregar ubicación" sin salir del formulario.
- Indicá el **horario de inicio y fin de carga** (ambos obligatorios).
- Seleccioná la **ubicación de descarga** y sus horarios de inicio y fin (también obligatorios).
- Si la carga requiere balanza, tildá el checkbox "Requiere balanza". Se habilitarán los campos para seleccionar la ubicación de balanza y sus horarios de inicio y fin.

**Validaciones:**
- Todos los campos son obligatorios.
- Las horas de inicio deben ser menores a las de fin.
- Si falta algún campo o hay error en los horarios, el sistema te lo indicará y no podrás avanzar.

**Consejo:**
- Si no encontrás la ubicación que necesitás, creala en el momento. No hace falta salir del paso.

---

### Paso 2: Seleccionar kilómetros y cargamento

**¿Qué hacer?**
- Ingresá la **cantidad de kilómetros** (solo números positivos).
- Seleccioná el **tipo de cargamento** desde el autocompletado.

**Validaciones:**
- Ambos campos son obligatorios.
- No se puede avanzar si falta alguno.

**Consejo:**
- Si tu cargamento no está bien representado en la lista, contactá a un Administrador para que lo agregue o modifique según tus necesidades.

---

### Paso 3: Seleccionar tarifa

**¿Qué hacer?**
- Ingresá la **tarifa** (número, puede tener decimales, máximo 12 dígitos).
- Seleccioná el **tipo de tarifa** de la lista.
- Indicá si la tarifa **incluye IVA** tildando el checkbox si corresponde.

**Validaciones:**
- Tarifa y tipo de tarifa son obligatorios.
- No se puede avanzar si falta alguno.

---

### Paso 4: Seleccionar tipos de acoplados permitidos

**¿Qué hacer?**
- Seleccioná al menos un tipo de acoplado permitido para la carga (por ejemplo: Batea, Semirremolque, Sider, Bitren, etc.).
- Podés ver imágenes de cada tipo para facilitar la elección.

**Validaciones:**
- Es obligatorio seleccionar al menos un tipo de acoplado.
- No se puede avanzar si no se selecciona ninguno.

---

### Paso 5: Más información

**¿Qué hacer?**
- Escribí una **descripción** de la carga (máximo 100 caracteres).
- Ingresá la **planta de procedencia RUCA**.
- Ingresá el **destino RUCA**.
- Ingresá la **tolerancia** (número, obligatorio).

**Validaciones:**
- Todos los campos son obligatorios.
- No se puede finalizar la carga si falta alguno.

---

### ¿Cómo es el proceso de edición?
- Cuando editás una carga, el mismo formulario stepper se abre con los datos ya completados.
- Podés modificar cualquier campo permitido y avanzar o retroceder entre los pasos.
- Al guardar, los cambios se aplican a la carga existente.
- Si la carga ya tiene turnos asignados, cambiar ciertos datos (como tarifa o ubicaciones) puede afectar a los turnos ya creados.

---

## Borrar una Carga

- Para borrar una carga, primero debés seleccionarla en la lista de cargas.
- Solo se puede borrar una carga si **no tiene cupos asignados**. Si intentás borrar una carga con cupos, el sistema no lo permitirá.
- El botón de borrar suele estar representado por un ícono de basurita roja en la interfaz.
- Al borrar una carga, se elimina toda su información del sistema.

**Advertencia:**
- Si la carga tiene turnos o cupos asociados, primero debés eliminar esos cupos/turnos antes de poder borrar la carga.
- Solo los roles con permiso pueden borrar cargas (ver tabla de permisos).

---

## Notas importantes
- Si falta algún campo obligatorio, el sistema mostrará un mensaje de error y no permitirá guardar.
- Solo los roles con permiso pueden crear, editar o borrar cargas (ver tabla de permisos).
- El proceso es 100% guiado y no permite avanzar si hay errores o faltan datos.
- Si necesitás agregar un cargamento o tipo de tarifa que no existe, contactá a un Administrador. 