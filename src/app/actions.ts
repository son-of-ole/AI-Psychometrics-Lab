'use server'

import { supabase } from '@/lib/supabase';
import { ModelProfile } from '@/lib/psychometrics/types';

/**
 * Persist a run record into the 'runs' table in Supabase.
 *
 * The function maps fields from `profile` into the inserted row:
 * - `model_name` from `profile.modelName`
 * - `persona` from `profile.persona`, defaulting to `"Base Model"` if missing
 * - `config` containing `systemPrompt` from `profile`
 * - `results` from `profile.results`
 * - `execution_logs` from `profile.logs`, defaulting to an empty array if missing
 * - `created_at` derived from `profile.timestamp`
 *
 * @param profile - The run data to save; values from this object are used to build the inserted row.
 * @returns An object with `success: true` on successful insert, or `success: false` and an `error` message if Supabase is not configured or the insert fails.
 */
export async function saveRun(profile: ModelProfile) {
    if (!supabase) {
        return { success: false, error: 'Supabase is not configured' };
    }

    try {
        const { error } = await supabase
            .from('runs')
            .insert({
                model_name: profile.modelName,
                persona: profile.persona || 'Base Model', // Default to Base Model
                config: { systemPrompt: profile.systemPrompt }, // Save config
                results: profile.results,
                execution_logs: profile.logs || [], // Save logs if available
                created_at: new Date(profile.timestamp).toISOString(),
            });

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('Error saving run:', error);
        return { success: false, error: error.message };
    }
}