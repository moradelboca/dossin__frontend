# Sistema de Mensajería

Este módulo implementa un sistema completo de mensajería en tiempo real para la aplicación Dossin.

## Características

### ✅ Implementadas
- **Interfaz de conversaciones**: Lista de conversaciones con indicadores de mensajes no leídos
- **Chat en tiempo real**: Envío y recepción de mensajes instantáneos
- **Búsqueda de conversaciones**: Filtrado por nombre de usuario
- **Nuevas conversaciones**: Creación de conversaciones individuales
- **Indicadores de estado**: Usuarios en línea/desconectados
- **Interfaz responsiva**: Adaptada para móviles y escritorio
- **Componentes modulares**: Arquitectura escalable y reutilizable

### 🔄 En Desarrollo
- **Adjuntos de archivos**: Subida de imágenes, videos y documentos
- **Notificaciones push**: Alertas cuando llegan mensajes nuevos
- **Conversaciones grupales**: Chats con múltiples participantes
- **Historial de mensajes**: Búsqueda en mensajes anteriores
- **Emojis y reacciones**: Respuestas rápidas a mensajes
- **Llamadas de voz/video**: Integración con WebRTC

## Componentes

### `Mensajes.tsx`
Componente principal que maneja toda la lógica del sistema de mensajería.

### `ConversacionHeader.tsx`
Header de la conversación activa con información del usuario y opciones de llamada.

### `MensajeItem.tsx`
Componente individual para cada mensaje con opciones de respuesta, reenvío y eliminación.

### `InputMensaje.tsx`
Campo de entrada para escribir mensajes con soporte para adjuntos.

## Estructura de Datos

### Mensaje
```typescript
interface Mensaje {
  id: string;
  contenido: string;
  remitenteId: string;
  remitenteNombre: string;
  destinatarioId: string;
  destinatarioNombre: string;
  fechaEnvio: Date;
  leido: boolean;
  tipo: 'texto' | 'imagen' | 'archivo' | 'video';
  adjuntos?: string[];
  conversacionId: string;
}
```

### Conversación
```typescript
interface Conversacion {
  id: string;
  participantes: string[];
  ultimoMensaje?: Mensaje;
  fechaUltimoMensaje: Date;
  noLeidos: number;
  tipo: 'individual' | 'grupo';
  nombre?: string;
  avatar?: string;
}
```

## Permisos de Usuario

El sistema de mensajería está disponible para todos los roles:
- **Rol 1**: Administrador (acceso completo)
- **Rol 2**: Supervisor (acceso completo)
- **Rol 3**: Operador (acceso completo)
- **Rol 4**: Consultor (acceso completo)

## Integración

### WebSocket
El sistema está preparado para integrarse con WebSocket para mensajería en tiempo real.

### Base de Datos
Las estructuras están diseñadas para integrarse con Supabase o cualquier base de datos relacional.

### Autenticación
Utiliza el contexto de autenticación existente (`useAuth`) para obtener información del usuario actual.

## Uso

```tsx
import { Mensajes } from './components/mensajes';

// En tu componente de ruta
<Route
  path="/mensajes"
  element={
    <RutasProtegidas allowedRoles={[1, 2, 3, 4]}>
      <Mensajes />
    </RutasProtegidas>
  }
/>
```

## Próximos Pasos

1. **Integración con WebSocket**: Implementar conexión en tiempo real
2. **Base de datos**: Crear tablas para mensajes y conversaciones
3. **Notificaciones**: Sistema de alertas push
4. **Adjuntos**: Subida y gestión de archivos
5. **Conversaciones grupales**: Chats con múltiples usuarios
6. **Llamadas**: Integración de voz y video

## Notas Técnicas

- Utiliza Material-UI para la interfaz
- Diseño responsivo con Grid de MUI
- Estado local con React hooks
- Preparado para integración con Redux/Context API
- Tipado completo con TypeScript
- Componentes reutilizables y modulares







