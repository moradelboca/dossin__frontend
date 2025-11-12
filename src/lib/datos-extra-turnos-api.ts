import { supabaseAgro } from './supabase';
import type {
  MaestroAtributo,
  MaestroAtributoCreate,
  MaestroAtributoUpdate,
  DatosExtraTurno,
  DatosExtraTurnoCreate,
} from '../types/datos-extra';

// =====================================================
// MAESTRO ATRIBUTOS TURNOS - CRUD Operations
// =====================================================

/**
 * Get all active attribute definitions (soft delete filter)
 */
export async function getAtributos(): Promise<MaestroAtributo[]> {
  try {
    const { data, error } = await supabaseAgro
      .from('maestro_atributos_turnos')
      .select('*')
      .is('deleted_at', null) // Only return active attributes
      .order('nombre_atributo', { ascending: true });

    if (error) {
      console.error('Error fetching atributos:', error);
      if (error.code === 'PGRST205') {
        console.warn('Table maestro_atributos_turnos does not exist. Please run the migration first.');
        return [];
      }
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAtributos:', error);
    return [];
  }
}

/**
 * Create a new attribute definition
 */
export async function createAtributo(atributo: MaestroAtributoCreate): Promise<MaestroAtributo | null> {
  try {
    const { data, error } = await supabaseAgro
      .from('maestro_atributos_turnos')
      .insert([atributo])
      .select()
      .single();

    if (error) {
      console.error('Error creating atributo:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createAtributo:', error);
    return null;
  }
}

/**
 * Update an attribute definition
 */
export async function updateAtributo(
  id: number,
  updates: MaestroAtributoUpdate
): Promise<boolean> {
  try {
    const { error } = await supabaseAgro
      .from('maestro_atributos_turnos')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating atributo:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in updateAtributo:', error);
    return false;
  }
}

/**
 * Delete an attribute definition (soft delete)
 * Sets deleted_at timestamp instead of physically deleting the record
 */
export async function deleteAtributo(id: number): Promise<boolean> {
  try {
    const { error } = await supabaseAgro
      .from('maestro_atributos_turnos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null); // Only allow deleting if not already deleted

    if (error) {
      console.error('Error deleting atributo:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAtributo:', error);
    return false;
  }
}

/**
 * Check if an attribute is being used in any turno
 * Returns the count of turnos that have data for this attribute
 * 
 * Note: PostgREST has limitations with complex JSONB queries, so we fetch
 * all records and filter client-side. For better performance with large datasets,
 * consider creating a database function.
 */
export async function checkAtributoEnUso(nombreAtributo: string): Promise<number> {
  try {
    // Fetch all datos_extra_turnos records
    // In production with large datasets, consider using a database function
    const { data, error } = await supabaseAgro
      .from('datos_extra_turnos')
      .select('datos');

    if (error) {
      console.error('Error checking atributo usage:', error);
      return 0;
    }

    if (!data) {
      return 0;
    }

    // Filter records where the attribute exists and has a non-null value
    const count = data.filter((record) => {
      const datos = record.datos as Record<string, any>;
      return datos && datos[nombreAtributo] !== undefined && datos[nombreAtributo] !== null;
    }).length;

    return count;
  } catch (error) {
    console.error('Error in checkAtributoEnUso:', error);
    return 0;
  }
}

// =====================================================
// DATOS EXTRA TURNOS - CRUD Operations
// =====================================================

/**
 * Get datos extra for a specific turno
 */
export async function getDatosExtraTurno(turnoId: number): Promise<DatosExtraTurno | null> {
  try {
    const { data, error } = await supabaseAgro
      .from('datos_extra_turnos')
      .select('*')
      .eq('turno_id', turnoId)
      .single();

    if (error) {
      // If no record found, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching datos extra turno:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getDatosExtraTurno:', error);
    return null;
  }
}

/**
 * Get all datos extra with turno information
 */
export async function getAllDatosExtra(): Promise<DatosExtraTurno[]> {
  try {
    const { data, error } = await supabaseAgro
      .from('datos_extra_turnos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all datos extra:', error);
      if (error.code === 'PGRST205') {
        console.warn('Table datos_extra_turnos does not exist. Please run the migration first.');
        return [];
      }
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllDatosExtra:', error);
    return [];
  }
}

/**
 * Save or update datos extra for a turno
 */
export async function saveDatosExtraTurno(
  turnoId: number,
  ctg: string | undefined,
  empresa: string | undefined,
  datos: Record<string, string | number>
): Promise<DatosExtraTurno | null> {
  try {
    // Check if record exists
    const existing = await getDatosExtraTurno(turnoId);

    const payload: DatosExtraTurnoCreate = {
      turno_id: turnoId,
      ctg,
      empresa_titular_carta_de_porte: empresa,
      datos,
    };

    if (existing) {
      // Update existing record
      const { data, error } = await supabaseAgro
        .from('datos_extra_turnos')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('turno_id', turnoId)
        .select()
        .single();

      if (error) {
        console.error('Error updating datos extra turno:', error);
        throw error;
      }

      return data;
    } else {
      // Create new record
      const { data, error } = await supabaseAgro
        .from('datos_extra_turnos')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Error creating datos extra turno:', error);
        throw error;
      }

      return data;
    }
  } catch (error) {
    console.error('Error in saveDatosExtraTurno:', error);
    return null;
  }
}

/**
 * Delete datos extra for a turno
 */
export async function deleteDatosExtraTurno(turnoId: number): Promise<boolean> {
  try {
    const { error } = await supabaseAgro
      .from('datos_extra_turnos')
      .delete()
      .eq('turno_id', turnoId);

    if (error) {
      console.error('Error deleting datos extra turno:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteDatosExtraTurno:', error);
    return false;
  }
}

