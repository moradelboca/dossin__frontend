# Permisos del rol: Logística

| Entidad      | Ver | Crear | Editar | Borrar | Notas adicionales                  |
|--------------|-----|-------|--------|--------|------------------------------------|
| Cargas       | ✔   | ✔     | ✔      | -      | No puede eliminar cargas           |
| Cupos        | ✔   | ✔     | ✔      | ✔      | Puede corregir turnos con error    |
| Turnos       | ✔   | ✔     | ✔      | ✔      | Puede ver todos los turnos, pero solo puede editar turnos en estados: Con errores, Validado. No puede cambiar estado libremente. |
| Usuarios     | -   | -     | -      | -      | No tiene acceso                    |
| Colaboradores| ✔   | ✔     | ✔      | -      | No puede eliminar colaboradores    |
| Empresas     | ✔   | ✔     | ✔      | -      | No puede eliminar empresas         |
| Contratos    | ✔   | ✔     | ✔      | -      | No tiene acceso                    |
| Camiones     | ✔   | ✔     | ✔      | -      | No puede eliminar camiones         |
| Ubicaciones  | ✔   | ✔     | ✔      | -      | No puede agregar ni eliminar ubicaciones |
| Inconvenientes|✔   | ✔     | ✔      | -      | No puede eliminar inconvenientes   |
| Clima        | ✔   | -     | -      | -      | Solo consulta                      |
| Calculadora  | ✔   | -     | -      | -      | Solo consulta                      |
| Dashboard    | -   | -     | -      | -      | No tiene acceso                    |

**Notas:**
- Logística puede ver todos los turnos sin importar su estado.
- Solo puede editar turnos en estado "Con errores" y "Validado".
- Puede corregir turnos con errores y crear/editar cupos y cargas, pero no eliminarlas.
