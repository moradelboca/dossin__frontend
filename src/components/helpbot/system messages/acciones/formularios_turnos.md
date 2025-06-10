# Formularios de Turnos: Explicación y Uso

> **Nota:** Los permisos para acceder o editar cada formulario dependen del estado del turno y del rol del usuario. Para saber qué puede hacer cada rol en cada estado, consultá los archivos de la carpeta `permisos/`.

---

## 1. Turno con Errores (Formulario de Corrección)
- Permite corregir los datos principales del turno que están incompletos o erróneos.
- **Campos:** colaborador (chofer), empresa, patente de camión, patente de acoplado, y si corresponde, patente de acoplado extra (bitren).
- **Cómo usarlo:** Seleccioná o corregí cada campo usando los autocompletados. Si la carga requiere bitren, también completá la patente del acoplado extra. Al guardar, el turno pasa a estado "Validado" si todo está correcto.
- **Consejo:** Si el colaborador, empresa, camión o acoplado no existen, primero deben ser creados en el sistema (consultá con un administrador si no aparecen).

---

## 2. Cargar Tara (Formulario de Tara)
- Permite ingresar el peso tara del camión (peso vacío).
- **Campo:** Peso tara (kg, obligatorio, solo números positivos).
- **Cómo usarlo:** Ingresá el valor y guardá para avanzar el turno al siguiente estado ("Tarado").

---

## 3. Cargar Peso Bruto (Formulario de Peso Bruto)
- Permite ingresar el peso bruto del camión (camión cargado).
- **Campo:** Peso bruto (kg, obligatorio, solo números positivos).
- **Cómo usarlo:** Ingresá el valor y guardá para avanzar el turno al siguiente estado ("Cargado").

---

## 4. Carta de Porte (Formulario de CP y CTG)
- Permite ingresar o ver el número de Carta de Porte y el número de CTG (Código de Trazabilidad de Granos).
- **Campos:** Número de carta de porte, número de CTG (ambos obligatorios, solo dígitos).
- **Cómo usarlo:** Ingresá ambos números y guardá. El número de CTG debe ser único (el sistema no permite duplicados). Si ya existe una carta de porte para el turno, se puede actualizar o eliminar desde el mismo formulario.

---

## 5. Pesaje Descargado (Formulario de Kg Descargados)
- Permite ingresar el peso descargado en destino.
- **Campo:** Kilogramos descargados (obligatorio, solo números positivos).
- **Cómo usarlo:** Ingresá el valor y guardá para actualizar el turno.

---

## 6. Factura (Formulario de Factura)
- Permite asociar una factura al turno, ingresando datos como tipo de factura, fecha, IVA, total, punto de venta y número de comprobante.
- **Campos:** Tipo de factura, fecha, IVA, total sin IVA, punto de venta, número de comprobante, turnos asociados.
- **Cómo usarlo:** Seleccioná el tipo de factura, ingresá los datos y asociá la factura a uno o varios turnos (en modo creación). Si la factura ya existe, el sistema preguntará si se quiere asociar también a este turno.

---

## 7. Adelantos (Formulario de Adelanto de Gasoil o Efectivo)
- Permite registrar adelantos de pago para el turno, ya sea en gasoil o efectivo.
- **Cómo usarlo:** Elegí la pestaña correspondiente (Gasoil o Efectivo), completá los datos requeridos y guardá para registrar el adelanto.

---

## 8. Orden de Pago (Formulario de Pago)
- Permite ingresar el número de orden de pago para registrar el pago del turno.
- **Campo:** Número de orden de pago (obligatorio).
- **Cómo usarlo:** Ingresá el número y guardá para actualizar el estado del turno a "Pagado".

---

## Notas generales
- Cada formulario valida los campos antes de permitir guardar.
- Si falta algún dato obligatorio, el sistema muestra un mensaje de error.
- Los formularios pueden mostrar botones de eliminar para quitar datos asociados (ej: carta de porte, tara, factura).
- Si no encontrás un dato en los autocompletados (colaborador, empresa, camión, acoplado), consultá con un administrador para que lo agregue.

---

# Formularios y acciones por estado de turno

A continuación se detalla, para cada estado, qué formulario se puede abrir, qué campos se editan y qué ocurre al guardar.

## Estados de un turno y formularios disponibles

### 1. Con errores
- **Formulario de corrección:** Permite editar todos los campos obligatorios (chofer, empresa, camión, acoplado, acoplado extra si corresponde). Al guardar, el turno pasa a "Validado" si los datos son correctos.
- **Formulario de adelanto:** Permite registrar adelantos de pago (gasoil o efectivo).
- **Eliminar:** Se puede eliminar el turno si es necesario.

### 2. Creado
- **Formulario de edición:** Permite editar todos los datos del turno.
- **Formulario de adelanto:** Permite registrar adelantos de pago.
- **Validar:** Al guardar, el turno pasa a "Validado".
- **Eliminar:** Se puede eliminar el turno si es necesario.

### 3. Validado
- **Formulario de corrección:** Permite editar datos incompletos o erróneos.
- **Formulario de adelanto:** Permite registrar adelantos de pago.
- **Autorizar:** Al guardar, el turno pasa a "Autorizado".
- **Eliminar:** Se puede eliminar el turno si es necesario.

### 4. Cancelado
- **Ver detalles:** Solo consulta, no se pueden editar datos.

### 5. Autorizado
- **Formulario de cargar tara:** Permite ingresar el peso tara (solo kg netos si corresponde). Al guardar, el turno pasa a "Tarado".
- **Formulario de adelanto:** Permite registrar adelantos de pago.
- **Eliminar:** Se puede eliminar el turno si es necesario.

### 6. Tarado
- **Formulario de cargar peso bruto:** Permite ingresar el peso bruto (solo kg bruto si corresponde). Al guardar, el turno pasa a "Cargado".
- **Formulario de adelanto:** Permite registrar adelantos de pago.
- **Eliminar:** Se puede eliminar el turno si es necesario.

### 7. Cargado
- **Ver carta de porte:** Permite ver la carta de porte asociada.
- **Formulario de cargar carta de porte:** Permite ingresar número de carta de porte y CTG (único por turno). Si el CTG ya existe, el sistema muestra error y no deja guardar.
- **Formulario de adelanto:** Permite registrar adelantos de pago.
- **Eliminar:** Se puede eliminar el turno si es necesario.

### 8. En viaje
- **Formulario de pesaje descargado:** Permite ingresar el peso descargado en destino.
- **Formulario de adelanto:** Permite registrar adelantos de pago.
- **Eliminar:** Se puede eliminar el turno si es necesario.

### 9. Descargado
- **Formulario de factura:** Permite asociar una factura al turno. Si la factura ya existe, el sistema preguntará si se quiere asociar también a este turno.
- **Formulario de adelanto:** Permite registrar adelantos de pago.
- **Eliminar:** Se puede eliminar el turno si es necesario.

### 10. Facturado
- **Ver pago:** Permite ver los datos de pago asociados.
- **Formulario de pago:** Permite ingresar monto, fecha y método de pago.
- **Formulario de adelanto:** Permite registrar adelantos de pago.
- **Eliminar:** Se puede eliminar el turno si es necesario.

### 11. Pagado
- **Ver detalles:** Solo consulta, no se pueden editar datos.
- **Formulario de adelanto:** Permite registrar adelantos de pago.

---

## Notas generales sobre los estados
- Si no ves un turno, probablemente tu rol no tiene permiso para ese estado (ver carpeta de permisos).
- El número de CTG debe ser único para cada turno.
- Los botones y acciones pueden variar según el estado. 