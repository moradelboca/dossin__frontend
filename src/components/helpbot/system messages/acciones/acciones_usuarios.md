# Acciones sobre Usuarios: Crear, Editar y Borrar

Este archivo explica **todas las acciones principales que se pueden realizar sobre usuarios**: cómo crearlos, cómo editarlos y cómo borrarlos. El proceso es guiado y utiliza formularios claros para cada acción.

---

## Crear o Editar un Usuario

El proceso de **crear** y **editar** un usuario es muy similar. Al editar, los campos ya aparecen completados con los datos existentes y podés modificarlos según necesidad.

### ¿Cómo funciona el proceso?

1. Ingresá los **datos obligatorios**: nombre, apellido, email, rol, y cualquier otro campo requerido por el sistema.
2. Asigná el **rol** y los permisos correspondientes.
3. Presioná "Guardar" para crear o actualizar el usuario.

**Validaciones:**
- Todos los campos obligatorios deben estar completos.
- El email debe ser único y válido.
- Si falta algún campo obligatorio, el sistema mostrará un mensaje de error y no permitirá guardar.

**Consejos y advertencias:**
- Si necesitás modificar algún dato, editá el campo correspondiente y guardá los cambios.
- Si el email ya existe en el sistema, no se podrá crear un nuevo usuario con el mismo email.

---

## ¿Cómo es el proceso de edición?
- Cuando editás un usuario, el formulario se abre con los datos ya completados.
- Podés modificar cualquier campo permitido y guardar los cambios.
- Los cambios se aplican al usuario existente.

---

## Borrar un Usuario

- Para borrar un usuario, primero debés seleccionarlo en la lista.
- El botón de borrar suele estar representado por un ícono de basurita en la interfaz.
- Al borrar, se elimina toda la información del usuario del sistema.

**Advertencia:**
- Si el usuario está asociado a cargas, turnos u otros datos, asegurate de revisar las dependencias antes de borrar.
- Solo los roles con permiso pueden borrar usuarios (ver tabla de permisos).

---

## Notas importantes
- Solo los roles con permiso pueden crear, editar o borrar usuarios (ver tabla de permisos).
- El proceso es 100% guiado y no permite avanzar si hay errores o faltan datos.
- Si necesitás agregar un rol o permiso que no aparece, contactá a un Administrador. 