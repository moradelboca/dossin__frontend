import { createClient } from '@supabase/supabase-js';

// Estas variables deberían estar en tu archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabasePubKey = import.meta.env.VITE_SUPABASE_PUB_KEY;
console.log('=== PRUEBA DE CONEXIÓN SUPABASE ===');
console.log('URL de Supabase:', supabaseUrl);
console.log('Clave anónima:', supabaseAnonKey ? '✅ Configurada' : '❌ No configurada');

// Cliente principal para archivos KMZ (usando anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('Cliente Supabase:', supabase ? '✅ Creado' : '❌ No creado');

// Cliente para el módulo agro (usando public key)
export const supabaseAgro = createClient(supabaseUrl, supabasePubKey);

// Bucket para almacenar archivos KMZ
export const KMZ_BUCKET_NAME = 'kmz-files';

// Función para probar la conexión a Supabase
export async function testSupabaseConnection(): Promise<boolean> {
    try {
        // Verificar que las variables estén configuradas
        if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
            console.error('❌ VITE_SUPABASE_URL no está configurado correctamente');
            return false;
        }
        
        if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
            console.error('❌ VITE_SUPABASE_ANON_KEY no está configurado correctamente');
            return false;
        }
        
        console.log('Probando conexión a Supabase...');
        
        // Listar buckets para verificar la conexión
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
            console.error('❌ Error listando buckets:', bucketsError);
            console.error('Detalles del error:', {
                message: bucketsError.message,
                name: bucketsError.name
            });
            return false;
        }
        
        console.log('✅ Buckets disponibles:', buckets);
        
        // Verificar si existe el bucket kmz-files
        const kmzBucket = buckets.find(bucket => bucket.name === KMZ_BUCKET_NAME);
        if (!kmzBucket) {
            console.error(`❌ Bucket '${KMZ_BUCKET_NAME}' no encontrado`);
            console.log('Buckets existentes:', buckets.map(b => b.name));
            return false;
        }
        
        console.log('✅ Bucket kmz-files encontrado:', kmzBucket);
        console.log('=== CONEXIÓN EXITOSA ===');
        return true;
        
    } catch (error) {
        console.error('❌ Error probando conexión:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No disponible');
        return false;
    }
}

// Función para subir archivo KMZ a Supabase Storage
export async function uploadKMZToSupabase(
    file: File, 
    loteId: string, 
    ubicacionId: string
): Promise<{ path: string; url: string } | null> {
    try {
        console.log('Iniciando subida de archivo:', file.name);
        console.log('Lote ID:', loteId);
        console.log('Ubicación ID:', ubicacionId);
        
        // Crear un nombre único para el archivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${loteId}_${ubicacionId}_${Date.now()}.${fileExt}`;
        const filePath = `${ubicacionId}/${loteId}/${fileName}`;
        
        console.log('Ruta del archivo:', filePath);
        console.log('Tamaño del archivo:', file.size, 'bytes');

        // Verificar que el bucket existe antes de subir
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        if (bucketsError) {
            console.error('Error listando buckets:', bucketsError);
            throw bucketsError;
        }
        
        const kmzBucket = buckets.find(bucket => bucket.name === KMZ_BUCKET_NAME);
        if (!kmzBucket) {
            throw new Error(`Bucket '${KMZ_BUCKET_NAME}' no encontrado`);
        }

        // Determinar el tipo MIME correcto basado en la extensión del archivo
        let mimeType = file.type;
        if (file.name.toLowerCase().endsWith('.kml')) {
            mimeType = 'application/vnd.google-earth.kml+xml';
        } else if (file.name.toLowerCase().endsWith('.kmz')) {
            mimeType = 'application/vnd.google-earth.kmz';
        }
        
        console.log('Tipo MIME detectado:', file.type);
        console.log('Tipo MIME corregido:', mimeType);
        
        // Subir el archivo al bucket con el tipo MIME correcto
        const { error } = await supabase.storage
            .from(KMZ_BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: mimeType
            });

        if (error) {
            console.error('Error uploading file:', error);
            throw error;
        }

        console.log('Archivo subido exitosamente');

        // Obtener la URL pública del archivo
        const { data: urlData } = supabase.storage
            .from(KMZ_BUCKET_NAME)
            .getPublicUrl(filePath);

        return {
            path: filePath,
            url: urlData.publicUrl
        };
    } catch (error) {
        console.error('Error in uploadKMZToSupabase:', error);
        return null;
    }
}

// Función para descargar archivo KMZ desde Supabase Storage
export async function downloadKMZFromSupabase(filePath: string): Promise<ArrayBuffer | null> {
    try {
        const { data, error } = await supabase.storage
            .from(KMZ_BUCKET_NAME)
            .download(filePath);

        if (error) {
            console.error('Error downloading file:', error);
            throw error;
        }

        return await data.arrayBuffer();
    } catch (error) {
        console.error('Error in downloadKMZFromSupabase:', error);
        return null;
    }
}

// Función para eliminar archivo KMZ de Supabase Storage
export async function deleteKMZFromSupabase(filePath: string): Promise<boolean> {
    try {
        const { error } = await supabase.storage
            .from(KMZ_BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error('Error deleting file:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error in deleteKMZFromSupabase:', error);
        return false;
    }
}

// Función para listar archivos KMZ de un lote específico
export async function listKMZFilesForLote(
    ubicacionId: string, 
    loteId: string
): Promise<string[]> {
    try {
        const { data, error } = await supabase.storage
            .from(KMZ_BUCKET_NAME)
            .list(`${ubicacionId}/${loteId}`);

        if (error) {
            console.error('Error listing files:', error);
            throw error;
        }

        return data.map(file => file.name);
    } catch (error) {
        console.error('Error in listKMZFilesForLote:', error);
        return [];
    }
}

// =====================================================
// FUNCIONES PARA FOTOS DE TURNOS
// =====================================================

// Función para subir foto de turno a Supabase Storage
export async function uploadFotoTurnoToSupabase(
    file: File, 
    turnoId: string | number,
    tipo: 'tara' | 'bruto' | 'remito'
): Promise<{ path: string; url: string } | null> {
    try {
        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            throw new Error('El archivo debe ser una imagen');
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${turnoId}_${tipo}_${Date.now()}.${fileExt}`;
        const filePath = `turnos/${turnoId}/${tipo}/${fileName}`;
        
        // Verificar que el bucket existe antes de subir
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        if (bucketsError) {
            console.error('Error listando buckets:', bucketsError);
            throw bucketsError;
        }
        
        const kmzBucket = buckets.find(bucket => bucket.name === KMZ_BUCKET_NAME);
        if (!kmzBucket) {
            throw new Error(`Bucket '${KMZ_BUCKET_NAME}' no encontrado`);
        }

        // Determinar tipo MIME para imágenes
        let mimeType = file.type;
        if (!mimeType || mimeType === 'application/octet-stream') {
            if (fileExt === 'jpg' || fileExt === 'jpeg') {
                mimeType = 'image/jpeg';
            } else if (fileExt === 'png') {
                mimeType = 'image/png';
            } else if (fileExt === 'webp') {
                mimeType = 'image/webp';
            } else {
                mimeType = 'image/jpeg'; // Default
            }
        }
        
        // Subir el archivo al bucket con el tipo MIME correcto
        const { error } = await supabase.storage
            .from(KMZ_BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: mimeType
            });

        if (error) {
            console.error('Error uploading foto:', error);
            throw error;
        }

        // Obtener la URL pública del archivo
        const { data: urlData } = supabase.storage
            .from(KMZ_BUCKET_NAME)
            .getPublicUrl(filePath);

        return {
            path: filePath,
            url: urlData.publicUrl
        };
    } catch (error) {
        console.error('Error in uploadFotoTurnoToSupabase:', error);
        return null;
    }
}

// Función para guardar referencia de foto en la base de datos
export async function saveFotoTurnoReference(
    turnoId: string | number,
    tipo: 'tara' | 'bruto' | 'remito',
    path: string,
    url: string
): Promise<any | null> {
    try {
        // Validar que turnoId sea un string válido (UUID)
        const turnoIdStr = String(turnoId);
        if (!turnoIdStr || turnoIdStr.trim() === '') {
            throw new Error(`turnoId inválido: ${turnoId}`);
        }

        // Usar upsert para actualizar si ya existe una foto de ese tipo
        const { data, error } = await supabaseAgro
            .from('turnos_fotos')
            .upsert({
                turno_id: turnoIdStr,
                tipo_foto: tipo,
                path: path,
                url: url
            }, {
                onConflict: 'turno_id,tipo_foto'
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving foto reference:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in saveFotoTurnoReference:', error);
        return null;
    }
}

// Función para obtener fotos de un turno
export async function getFotosTurno(turnoId: string | number): Promise<any[]> {
    try {
        // Validar que turnoId sea un string válido (UUID)
        const turnoIdStr = String(turnoId);
        if (!turnoIdStr || turnoIdStr.trim() === '') {
            console.warn(`turnoId inválido: ${turnoId}, retornando array vacío`);
            return [];
        }

        const { data, error } = await supabaseAgro
            .from('turnos_fotos')
            .select('*')
            .eq('turno_id', turnoIdStr)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching fotos:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getFotosTurno:', error);
        return [];
    }
}

// Función para eliminar foto de turno
export async function deleteFotoTurno(
    turnoId: string | number,
    tipo: 'tara' | 'bruto' | 'remito'
): Promise<boolean> {
    try {
        // Validar que turnoId sea un string válido (UUID)
        const turnoIdStr = String(turnoId);
        if (!turnoIdStr || turnoIdStr.trim() === '') {
            throw new Error(`turnoId inválido: ${turnoId}`);
        }

        // Primero obtener la referencia para eliminar el archivo de storage
        const { data: fotoRef } = await supabaseAgro
            .from('turnos_fotos')
            .select('path')
            .eq('turno_id', turnoIdStr)
            .eq('tipo_foto', tipo)
            .single();

        if (fotoRef?.path) {
            // Eliminar de storage
            const { error: storageError } = await supabase.storage
                .from(KMZ_BUCKET_NAME)
                .remove([fotoRef.path]);

            if (storageError) {
                console.error('Error deleting foto from storage:', storageError);
            }
        }

        // Eliminar referencia de la base de datos
        const { error } = await supabaseAgro
            .from('turnos_fotos')
            .delete()
            .eq('turno_id', turnoIdStr)
            .eq('tipo_foto', tipo);

        if (error) {
            console.error('Error deleting foto reference:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error in deleteFotoTurno:', error);
        return false;
    }
}

// =====================================================
// FUNCIONES PARA REMITOS DE TURNOS
// =====================================================

// Función para guardar ID de remito en la base de datos
export async function saveRemitoId(
    turnoId: string | number,
    idRemito: string
): Promise<any | null> {
    try {
        // Validar que turnoId sea un string válido
        const turnoIdStr = String(turnoId);
        if (!turnoIdStr || turnoIdStr.trim() === '') {
            throw new Error(`turnoId inválido: ${turnoId}`);
        }

        if (!idRemito || idRemito.trim() === '') {
            throw new Error('idRemito es obligatorio');
        }

        // Usar upsert para actualizar si ya existe un remito para este turno
        const { data, error } = await supabaseAgro
            .from('turnos_remitos')
            .upsert({
                turno_id: turnoIdStr,
                id_remito: idRemito.trim()
            }, {
                onConflict: 'turno_id'
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving remito ID:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in saveRemitoId:', error);
        return null;
    }
}

// Función para obtener ID de remito de un turno
export async function getRemitoId(turnoId: string | number): Promise<string | null> {
    try {
        // Validar que turnoId sea un string válido
        const turnoIdStr = String(turnoId);
        if (!turnoIdStr || turnoIdStr.trim() === '') {
            console.warn(`turnoId inválido: ${turnoId}, retornando null`);
            return null;
        }

        const { data, error } = await supabaseAgro
            .from('turnos_remitos')
            .select('id_remito')
            .eq('turno_id', turnoIdStr)
            .maybeSingle();

        if (error) {
            // Si no existe registro o la tabla no existe, retornar null (no es un error crítico)
            if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('does not exist')) {
                console.warn('Tabla turnos_remitos no existe o no hay registro:', error.message);
                return null;
            }
            console.error('Error fetching remito ID:', error);
            return null;
        }

        return data?.id_remito || null;
    } catch (error: any) {
        // Manejar errores de tabla no existente o otros errores
        if (error?.message?.includes('does not exist') || error?.code === '42P01') {
            console.warn('Tabla turnos_remitos no existe aún. Ejecuta la migración create_turnos_remitos.sql');
            return null;
        }
        console.error('Error in getRemitoId:', error);
        return null;
    }
}

// Función para eliminar remito de un turno
export async function deleteRemitoId(turnoId: string | number): Promise<boolean> {
    try {
        // Validar que turnoId sea un string válido
        const turnoIdStr = String(turnoId);
        if (!turnoIdStr || turnoIdStr.trim() === '') {
            throw new Error(`turnoId inválido: ${turnoId}`);
        }

        const { error } = await supabaseAgro
            .from('turnos_remitos')
            .delete()
            .eq('turno_id', turnoIdStr);

        if (error) {
            console.error('Error deleting remito ID:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error in deleteRemitoId:', error);
        return false;
    }
}

// =====================================================
// FUNCIONES PARA CONTRATOS COMERCIALES
// =====================================================

// Obtener todos los contratos comerciales
export async function getContratosComerciales(): Promise<any[]> {
    try {
        const { data, error } = await supabaseAgro
            .from('ContratosComerciales')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching contratos comerciales:', error);
            // If table doesn't exist, return empty array with a warning
            if (error.code === 'PGRST205') {
                console.warn('Table ContratosComerciales does not exist. Please run the migration first.');
                return [];
            }
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in getContratosComerciales:', error);
        return [];
    }
}

// Obtener un contrato comercial por ID
export async function getContratoComercialById(id: number): Promise<any | null> {
    try {
        const { data, error } = await supabaseAgro
            .from('ContratosComerciales')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching contrato comercial:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getContratoComercialById:', error);
        return null;
    }
}

// Actualizar cargas asociadas a un contrato
export async function updateCargasAsociadas(
    contratoId: number, 
    cargasIds: number[]
): Promise<boolean> {
    try {
        const { error } = await supabaseAgro
            .from('ContratosComerciales')
            .update({ 
                cargasIds: cargasIds,
                updated_at: new Date().toISOString()
            })
            .eq('id', contratoId);

        if (error) {
            console.error('Error updating cargas asociadas:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error in updateCargasAsociadas:', error);
        return false;
    }
}

// Crear un nuevo contrato comercial
export async function createContratoComercial(contrato: any): Promise<any | null> {
    try {
        const { data, error } = await supabaseAgro
            .from('ContratosComerciales')
            .insert([contrato])
            .select()
            .single();

        if (error) {
            console.error('Error creating contrato comercial:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in createContratoComercial:', error);
        return null;
    }
}

// Actualizar un contrato comercial
export async function updateContratoComercial(
    id: number, 
    updates: any
): Promise<boolean> {
    try {
        const { error } = await supabaseAgro
            .from('ContratosComerciales')
            .update({ 
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Error updating contrato comercial:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error in updateContratoComercial:', error);
        return false;
    }
}

// Eliminar un contrato comercial
export async function deleteContratoComercial(id: number): Promise<boolean> {
    try {
        const { error } = await supabaseAgro
            .from('ContratosComerciales')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting contrato comercial:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error in deleteContratoComercial:', error);
        return false;
    }
}
