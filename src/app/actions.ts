'use server'

import { supabase } from '@/lib/supabase';
import { ModelProfile } from '@/lib/psychometrics/types';

/**
 * Persist a model run record to the Supabase `runs` table.
 *
 * @param profile - The run data to persist. Uses `profile.modelName`, `profile.persona` (defaults to "Base Model" if undefined), `profile.systemPrompt` (saved as `config.systemPrompt`), `profile.results`, `profile.logs` (defaults to `[]` if undefined), and `profile.timestamp` (converted to ISO for `created_at`).
 * @returns `{ success: true }` on successful insert, or `{ success: false, error: string }` containing an error message when the operation fails or Supabase is not configured.
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
                logs: profile.logs || [], // Save logs if available
                created_at: new Date(profile.timestamp).toISOString(),
            });

        if (error) throw error;
        return { success: true };
    } catch (error: unknown) {
        console.error('Error saving run:', error);
        return { success: false, error: (error as Error).message };
    }
}