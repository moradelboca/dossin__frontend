// Explicaciones de los estados de los turnos
export function getExplicacionEstado(estado: string) {
  switch ((estado || '').toLowerCase()) {
    case 'con errores':
      return {
        title: 'Estado: Con errores',
        sections: [
          'El turno fue generado automáticamente (por ejemplo, desde el chatbot), pero uno o más datos no coinciden con la base de datos. Puede deberse a errores de tipeo, datos inexistentes o información incompleta.',
          'En este estado, el turno queda bloqueado y no puede avanzar hasta que se corrijan los datos. Es visible para administración y logística.',
          {
            label: '¿Qué hacer ahora?',
            items: [
              'Contactar al chofer o usuario que generó el turno para validar los datos reales.',
              'Presionar el botón "Corregir" para editar los campos erróneos. Se resaltarán en rojo los datos que no coinciden.',
              'Si el dato no existe en la base, primero hay que crearlo (por ejemplo, una empresa o camión nuevo).',
              'Una vez corregidos todos los errores, el turno podrá avanzar a "Validado".'
            ]
          },
          'Recomendación: Siempre verificar con el usuario final antes de modificar datos importantes. Si el error es frecuente, revisar los formularios del chatbot.'
        ]
      };
    case 'creado':
      return {
        title: 'Estado: Creado',
        sections: [
          'El turno fue creado correctamente, pero aún no fue revisado ni validado por ningún usuario con permisos. Es el primer estado después de la carga manual o automática.',
          'Solo los administradores pueden ver y gestionar turnos en este estado. No es visible para logística ni para el campo.',
          {
            label: '¿Qué hacer ahora?',
            items: [
              'Revisar los datos del turno y presionar "Validar" si todo está correcto.',
              'Si hay errores, se puede presionar "Corregir" para editar los datos antes de validar.'
            ]
          },
          'Consejo: No dejes turnos en estado "Creado" mucho tiempo, ya que no avanzarán en el circuito.'
        ]
      };
    case 'validado':
      return {
        title: 'Estado: Validado',
        sections: [
          'El turno fue revisado y los datos están correctos, pero aún falta que alguien de logística autorice que ese camionero puede ir a cargar al punto de carga.',
          'En este estado, el turno es visible para administración y logística, pero todavía no para el campo.',
          {
            label: '¿Qué hacer ahora?',
            items: [
              'Presioná "Corregir" para revisar y confirmar que todos los datos del turno estén correctos. Esto es recomendable, ya que los datos impactan en el resto del proceso.',
              'Si ya verificaste que todo está bien, podés presionar "Autorizar" directamente para habilitar el turno.'
            ]
          },
          'Recomendamos siempre revisar los datos antes de autorizar, ya que cualquier error puede afectar el resto del proceso.'
        ]
      };
    case 'cancelado':
      return {
        title: 'Estado: Cancelado',
        sections: [
          'El turno fue cancelado y queda fuera de circuito. Puede haber sido cancelado por el productor, por un error en los datos, o porque el camión no va a salir.',
          'Todos los usuarios pueden ver turnos cancelados, pero solo un administrador puede revertir este estado o eliminar el turno.',
          {
            label: '¿Qué hacer ahora?',
            items: [
              'Si el turno fue cancelado por error, un administrador puede reactivarlo desde el panel de administración.',
              'Si el turno ya no es necesario, puede eliminarse definitivamente.'
            ]
          },
          'Advertencia: Una vez cancelado, el turno no puede avanzar ni ser modificado por usuarios comunes.'
        ]
      };
    case 'autorizado':
      return {
        title: 'Estado: Autorizado',
        sections: [
          'El turno está listo para ser cargado en el punto de carga. Ahora es visible para los ingenieros y el personal de campo.',
          'En este estado, el chofer puede presentarse en el punto de carga y se debe registrar el peso tara (camión vacío).',
          {
            label: '¿Qué hacer ahora?',
            items: [
              'Presionar el botón "Cargar Tara" para ingresar el peso del camión vacío apenas llega al punto de carga.',
              'Si hay algún error, se puede volver a "Corregir" antes de continuar.'
            ]
          },
          'Consejo: Registrar el peso tara lo antes posible para evitar demoras en la carga.'
        ]
      };
    case 'tarado':
      return {
        title: 'Estado: Tarado',
        sections: [
          'El camión ya fue cargado y se lo volvió a pesar con el cargamento. Se registra el peso bruto (camión cargado).',
          'Este estado es clave para calcular la mercadería transportada y habilita la emisión de la carta de porte.',
          {
            label: '¿Qué hacer ahora?',
            items: [
              'Presionar el botón "Cargar Peso Bruto" para ingresar el peso del camión cargado.',
              'Verificar que los datos coincidan con la documentación del chofer.'
            ]
          },
          'Advertencia: No se puede emitir la carta de porte hasta que se registre el peso bruto.'
        ]
      };
    case 'cargado':
      return {
        title: 'Estado: Cargado',
        sections: [
          'El camión ya fue cargado y está listo para emitir la carta de porte. Administración debe intervenir en este paso.',
          'Aparecen los botones "Ver CP" (ver carta de porte) y "Cargar CP" (asociar número de carta de porte y CTG).',
          {
            label: '¿Qué hacer ahora?',
            items: [
              'Presionar "Cargar CP" para asociar la carta de porte y el CTG al turno.',
              'Presionar "Ver CP" para revisar todos los datos antes de emitir la carta.'
            ]
          },
          'Recomendación: Verificar que todos los datos estén correctos antes de emitir la carta de porte, ya que luego no se pueden modificar.'
        ]
      };
    case 'en viaje':
      return {
        title: 'Estado: En viaje',
        sections: [
          'El camión está en tránsito hacia el destino. Ya se emitió la carta de porte y el turno está en manos del chofer.',
          'En este estado, el siguiente paso es registrar los kilos descargados una vez que el camión llegue a destino.',
          {
            label: '¿Qué hacer ahora?',
            items: [
              'Presionar el botón "Ingresar Kg Descargados" para registrar la mercadería efectiva entregada.'
            ]
          },
          'Nota: Los kilos descargados son los netos, no el peso total del camión. Es fundamental para la liquidación.'
        ]
      };
    case 'descargado':
      return {
        title: 'Estado: Descargado',
        sections: [
          'El camión llegó a destino y se descargó la mercadería. Ahora corresponde asociar la factura.',
          'Aparece el botón "+ Factura" para cargar los datos de la factura (número, sucursal, etc.).',
          {
            label: '¿Qué hacer ahora?',
            items: [
              'Presionar "+ Factura" y completar los datos requeridos.'
            ]
          },
          'Consejo: No demorar la carga de la factura para evitar retrasos en el pago.'
        ]
      };
    case 'facturado':
      return {
        title: 'Estado: Facturado',
        sections: [
          'Ya se cargaron los datos de la factura. El turno está listo para registrar el pago.',
          'Aparecen los botones "Ver Pago" (ver detalles) y "Pagar" (registrar el pago).',
          {
            label: '¿Qué hacer ahora?',
            items: [
              'Presionar "Pagar" para registrar el número de operación, forma de pago, etc.',
              'Presionar "Ver Pago" para revisar los datos antes de confirmar.'
            ]
          },
          'Advertencia: Solo después de registrar el pago el proceso estará completo.'
        ]
      };
    case 'pagado':
      return {
        title: 'Estado: Pagado',
        sections: [
          'El proceso está completo. El turno ya fue pagado y no se puede modificar más, salvo por intervención de un administrador.',
          'Solo un admin puede revertir un turno a un estado anterior. El turno queda como histórico y disponible para consulta.'
        ]
      };
    default:
      return null;
  }
}
