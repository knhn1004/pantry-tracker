'use server';
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export async function fetchItemsWithInventory() {
	const supabase = await createClerkSupabaseClient();
	const { data, error } = await supabase.from('items').select(`
            id,
            name,
            inventory (
                id,
                quantity,
                unit: units (id, name),
                location: locations (id, name),
                expiration_date
            )
        `);

	if (error) throw new Error('Failed to fetch items with inventory');
	return data;
}
