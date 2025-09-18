# Configuración de Supabase para Archivos KMZ

## Requisitos Previos

1. Tener una cuenta en [Supabase](https://supabase.com)
2. Crear un nuevo proyecto
3. Configurar Storage en tu proyecto

## Pasos de Configuración

### 1. Crear Bucket de Storage

En tu dashboard de Supabase, ve a **Storage** y crea un nuevo bucket llamado `kmz-files`.

**Configuración del Bucket:**
- **Public bucket**: ✅ Activado (para acceso público)
- **Allowed MIME types**: `application/vnd.google-earth.kmz, application/vnd.google-earth.kml+xml`

### 2. Configurar Políticas de Seguridad

Para el bucket `kmz-files`, configura las siguientes políticas:

#### Política de Inserción (INSERT)
```sql
CREATE POLICY "Users can upload KMZ files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'kmz-files');
```

#### Política de Lectura (SELECT)
```sql
CREATE POLICY "Users can view KMZ files" ON storage.objects
FOR SELECT USING (bucket_id = 'kmz-files');
```

#### Política de Eliminación (DELETE)
```sql
CREATE POLICY "Users can delete KMZ files" ON storage.objects
FOR DELETE USING (bucket_id = 'kmz-files');
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz de tu proyecto con las siguientes variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Backend URL (si ya existe)
VITE_BACKEND_URL=http://localhost:3000
```

### 4. Obtener Credenciales

1. Ve a **Settings** > **API** en tu dashboard de Supabase
2. Copia la **Project URL** y pégala en `VITE_SUPABASE_URL`
3. Copia la **anon public** key y pégala en `VITE_SUPABASE_ANON_KEY`

## Estructura de Archivos

Los archivos KMZ se almacenarán en la siguiente estructura:
```
kmz-files/
├── ubicacion_id_1/
│   ├── lote_id_1/
│   │   ├── lote_id_1_ubicacion_id_1_timestamp.kmz
│   │   └── lote_id_1_ubicacion_id_1_timestamp.kml
│   └── lote_id_2/
│       └── lote_id_2_ubicacion_id_1_timestamp.kmz
└── ubicacion_id_2/
    └── lote_id_1/
        └── lote_id_1_ubicacion_id_2_timestamp.kmz
```

## Funcionalidades Implementadas

- ✅ Subida de archivos KMZ/KML a Supabase Storage
- ✅ Descarga de archivos desde Supabase Storage
- ✅ Eliminación de archivos de Supabase Storage
- ✅ Asociación de archivos con lotes específicos
- ✅ Persistencia de archivos entre sesiones

## Notas Importantes

1. **Seguridad**: Las políticas de seguridad están configuradas para permitir acceso público a los archivos KMZ. Si necesitas más seguridad, puedes restringir el acceso por usuario.

2. **Límites**: Supabase tiene límites en el tamaño de archivos. Los archivos KMZ típicamente son pequeños, pero verifica los límites de tu plan.

3. **Backup**: Considera implementar un sistema de backup para los archivos KMZ, ya que son importantes para la operación del negocio.

## Próximos Pasos

1. **Integración con Backend**: Conectar con tu API para obtener información real de lotes y establecimientos
2. **Validación de Archivos**: Agregar validaciones para asegurar que los archivos KMZ sean válidos
3. **Compresión**: Implementar compresión de archivos para optimizar el almacenamiento
4. **Versiones**: Agregar sistema de versiones para archivos KMZ
