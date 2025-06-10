# Permisos del rol: Contable

| Entidad      | Ver | Crear | Editar | Borrar | Notas adicionales                  |
|--------------|-----|-------|--------|--------|------------------------------------|
| Cargas       | -   | -     | -      | -      | No puede eliminar cargas           |
| Cupos        | ✔   | ✔     | ✔      | ✔      | Puede corregir turnos con error    |
| Turnos       | ✔   | ✔     | ✔      | ✔      | Puede operar sobre estados: Autorizado, Tarado, Cargado, En viaje, Descargado, Facturado, Pagado. No puede cambiar estado libremente. |
| Usuarios     | -   | -     | -      | -      | No tiene acceso                    |
| Colaboradores| ✔   | ✔     | ✔      | -      | No puede eliminar colaboradores    |
| Empresas     | ✔   | ✔     | ✔      | -      | No puede eliminar empresas         |
| Contratos    | ✔   | ✔     | ✔      | -      | No puede eliminar contratos        |
| Camiones     | ✔   | ✔     | ✔      | -      | No puede eliminar camiones         |
| Ubicaciones  | ✔   | -     | -      | -      | No puede agregar ni eliminar ubicaciones |
| Inconvenientes|✔   | ✔     | ✔      | -      | No puede eliminar inconvenientes   |
| Clima        | -   | -     | -      | -      | No tiene acceso                    |
| Calculadora  | -   | -     | -      | -      | No tiene acceso                    |
| Dashboard    | -   | -     | -      | -      | No tiene acceso                    |

**Notas:**
- El Contable puede operar sobre turnos en estados avanzados, pero no puede cambiar el estado libremente.
- Puede crear, editar y eliminar cupos y turnos, pero no cargas.
