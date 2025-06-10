# Acciones sobre un Cupo: Crear, Editar y Borrar

Este archivo explica **todas las acciones principales que se pueden realizar sobre un cupo**: cómo crearlo, cómo editarlo y cómo borrarlo. El proceso es guiado y utiliza formularios claros para cada acción.

---

## Crear o Editar un Cupo

El proceso de **crear** y **editar** un cupo es muy similar. Al editar, los campos ya aparecen completados con los datos existentes y podés modificarlos según necesidad.

### ¿Cómo funciona el proceso?

1. **Seleccionar la carga** para la que querés crear o editar cupos.
2. Elegir los **días del mes** en los que los camiones podrán ir a cargar.
3. Para cada día, indicar la **cantidad de camiones permitidos** (cupo por día).
4. Completar todos los **datos obligatorios** del formulario.
5. Presionar "Guardar" para crear o actualizar el cupo.

**Validaciones:**
- No se pueden crear cupos con acoplado extra si la carga no tiene autorizado "bi tren", y viceversa.
- Todos los datos son obligatorios para crear o editar un cupo.
- Si falta algún campo obligatorio, el sistema mostrará un mensaje de error y no permitirá guardar.

**Consejos y advertencias:**
- Si necesitás modificar la cantidad de cupos para un día ya existente, simplemente editá el valor y guardá.
- Si la carga no tiene autorizado cierto tipo de camión/acoplado, el sistema no permitirá crear cupos para ese tipo.
- Si hay turnos asociados a un cupo, modificá con cuidado los datos para no afectar la operación.

---

## ¿Cómo es el proceso de edición?
- Cuando editás un cupo, el formulario se abre con los datos ya completados.
- Podés modificar cualquier campo permitido y guardar los cambios.
- Los cambios se aplican al cupo existente y pueden afectar los turnos asociados.

---

## Borrar un Cupo

- Para borrar un cupo, primero debés seleccionarlo en la lista de cupos.
- El botón de borrar suele estar representado por un ícono de basurita en la interfaz.
- Al borrar un cupo, se eliminan todos los turnos asociados a ese cupo.

**Advertencia:**
- Si el cupo tiene turnos asociados, estos también serán eliminados. Asegurate de revisar las consecuencias antes de borrar.
- Solo los roles con permiso pueden borrar cupos (ver tabla de permisos).

---

## Notas importantes
- Solo los roles con permiso pueden crear, editar o borrar cupos (ver tabla de permisos).
- El proceso es 100% guiado y no permite avanzar si hay errores o faltan datos.
- Si necesitás crear cupos para un tipo de camión/acoplado que no aparece, contactá a un Administrador. 