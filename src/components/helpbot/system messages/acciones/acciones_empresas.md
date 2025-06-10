# Acciones sobre Empresas: Crear, Editar y Borrar

Este archivo explica **todas las acciones principales que se pueden realizar sobre empresas**: cómo crearlas, cómo editarlas y cómo borrarlas. El proceso es guiado y utiliza formularios claros para cada acción.

---

## Crear o Editar una Empresa

El proceso de **crear** y **editar** una empresa es muy similar. Al editar, los campos ya aparecen completados con los datos existentes y podés modificarlos según necesidad.

### ¿Cómo funciona el proceso?

1. Ingresá los **datos obligatorios**: nombre, CUIT, dirección, tipo de empresa (proveedor, cliente, transportista, etc.), y cualquier otro campo requerido por el sistema.
2. Presioná "Guardar" para crear o actualizar la empresa.

**Validaciones:**
- Todos los campos obligatorios deben estar completos.
- El CUIT debe ser único y válido.
- Si falta algún campo obligatorio, el sistema mostrará un mensaje de error y no permitirá guardar.

**Consejos y advertencias:**
- Si necesitás modificar algún dato, editá el campo correspondiente y guardá los cambios.
- Si el CUIT ya existe en el sistema, no se podrá crear una nueva empresa con el mismo CUIT.

---

## ¿Cómo es el proceso de edición?
- Cuando editás una empresa, el formulario se abre con los datos ya completados.
- Podés modificar cualquier campo permitido y guardar los cambios.
- Los cambios se aplican a la empresa existente.

---

## Borrar una Empresa

- Para borrar una empresa, primero debés seleccionarla en la lista.
- El botón de borrar suele estar representado por un ícono de basurita en la interfaz.
- Al borrar, se elimina toda la información de la empresa del sistema.

**Advertencia:**
- Si la empresa está asociada a cargas, turnos u otros datos, asegurate de revisar las dependencias antes de borrar.
- Solo los roles con permiso pueden borrar empresas (ver tabla de permisos).

---

## Notas importantes
- Solo los roles con permiso pueden crear, editar o borrar empresas (ver tabla de permisos).
- El proceso es 100% guiado y no permite avanzar si hay errores o faltan datos.
- Si necesitás agregar un tipo de empresa que no aparece, contactá a un Administrador. 