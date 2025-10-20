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
