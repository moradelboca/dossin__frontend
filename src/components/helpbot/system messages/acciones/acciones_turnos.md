# Acciones sobre un Turno: Crear, Editar y Borrar

Este archivo explica **todas las acciones principales que se pueden realizar sobre un turno**: cómo crearlo (a través de los formularios de cada estado), cómo editarlo y cómo borrarlo. El proceso es guiado y cada acción depende del estado del turno y de los formularios disponibles.

---

## Formularios y acciones por estado de turno

A continuación se detalla, para cada estado, qué formulario se puede abrir, qué campos se editan y qué ocurre al guardar.

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

## ¿Cómo editar un turno?
- Para editar un turno, seleccioná el turno en la lista y abrí el formulario correspondiente según el estado.
- Los campos editables dependen del estado del turno (ver arriba).
- Al guardar, los cambios se aplican al turno existente y pueden modificar su estado.
- Si el turno ya tiene datos asociados (ej: carta de porte, factura), editá esos datos desde los formularios específicos.

---

## ¿Cómo borrar un turno?
- Para borrar un turno, seleccioná el turno en la lista y hacé click en el botón de eliminar (generalmente un ícono de basurita).
- El sistema pedirá confirmación antes de borrar.
- Al borrar un turno, se elimina toda su información del sistema.

**Advertencia:**
- Solo los roles con permiso pueden borrar turnos (ver tabla de permisos).
- Si el turno está asociado a otros datos (factura, carta de porte, etc.), asegurate de revisar las dependencias antes de borrar.

---

## Notas importantes
- Cada formulario valida los campos antes de permitir guardar.
- Si falta algún dato obligatorio, el sistema muestra un mensaje de error.
- Los formularios pueden mostrar botones de eliminar para quitar datos asociados (ej: carta de porte, tara, factura).
- Si no encontrás un dato en los autocompletados (colaborador, empresa, camión, acoplado), consultá con un administrador para que lo agregue.
- Solo los roles con permiso pueden crear, editar o borrar turnos (ver tabla de permisos). 