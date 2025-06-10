# Pantalla de Contratos

## Preguntas frecuentes
- ¿Cómo puedo ver o crear un contrato?
- ¿Dónde está el botón para editar o eliminar un contrato?
- ¿Cómo asocio una carga a un contrato?
- ¿Cómo creo una carga?

## ¿Cómo navegar hasta la pantalla de Contratos?
1. Seleccioná en la barra lateral **Contratos**.
2. Se abrirá la pantalla con el listado de contratos en formato tarjeta.

## ¿Cómo crear, editar, eliminar o asociar una carga a un contrato?
- Para **crear** un contrato, hacé clic en el botón **Agregar contrato +** que está arriba a la derecha de la pantalla. Completá el formulario que se abre.
- Para **editar** un contrato, buscá el contrato en la lista y hacé clic en el botón **Editar contrato** en la tarjeta del contrato.
- Para **eliminar** un contrato, hacé clic en el botón en **Editar Contrato** y luego abajo de todo **Eliminar contrato** (ícono de basurita).
- Para **asociar una carga** (crear una carga), buscá el contrato al que querés asociarla y hacé clic en el botón **Crear carga +** que aparece dentro de la tarjeta del contrato, generalmente en la parte inferior. Esto te llevará al formulario de creación de carga.

Para los pasos detallados de cómo completar la creación de una carga, consultá la sección de **acciones_cargas** y **acciones_contratos**.

¿Querés que te explique cómo crear una carga paso a paso o cómo asociarla a un contrato? ¡Decime cuál y te ayudo!

## Estructura general
- **Listado de contratos**: Se muestra una tarjeta por cada contrato, con información del titular, destinatario y cargas asociadas.
- **Botón 'Agregar contrato +'**: Permite crear un nuevo contrato. Acción asociada: `crear_contrato`.
- **Botón 'Editar contrato'**: Permite modificar los datos del contrato seleccionado. Acción asociada: `editar_contrato`.
- **Botón 'Crear carga +'**: Permite asociar una nueva carga al contrato. Acción asociada: `crear_carga` (vía contrato).
- **Detalle de cargas asociadas**: Se visualizan las cargas vinculadas al contrato, con información relevante de cada una.

## Diálogos y formularios
- **Formulario de contrato**: Permite crear o editar contratos, seleccionando empresas y roles obligatorios (titular, destinatario, destino, etc.).
- **Diálogo de carga**: Permite crear o editar cargas asociadas al contrato.

## Acciones relacionadas
- Las acciones de crear, editar y eliminar contratos están documentadas en la sección de acciones (`acciones/contratos.md`).
- La asociación de cargas a contratos se conecta con la gestión de cargas.

## Notas
- La interfaz se adapta a dispositivos móviles mostrando una versión simplificada.
