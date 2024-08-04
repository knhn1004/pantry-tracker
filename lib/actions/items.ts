'use server';
import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
            ),
			category: categories (id, name)
        `);

	if (error) throw new Error('Failed to fetch items with inventory');
	return data;
}

export async function useInventoryItem(
	inventoryId: string,
	quantityToUse: number
) {
	const supabase = await createClerkSupabaseClient();

	// First, get the current quantity
	const { data: currentInventory, error: fetchError } = await supabase
		.from('inventory')
		.select('quantity')
		.eq('id', inventoryId)
		.single();

	if (fetchError) {
		throw new Error('Failed to fetch current inventory');
	}

	if (!currentInventory) {
		throw new Error('Inventory item not found');
	}

	const newQuantity = currentInventory.quantity - quantityToUse;

	if (newQuantity < 0) {
		throw new Error('Not enough quantity available');
	}
	if (newQuantity === 0) {
		const { error: deleteError } = await supabase
			.from('inventory')
			.delete()
			.eq('id', inventoryId);
		if (deleteError) {
			throw new Error('Failed to delete inventory');
		}
	} else {
		const { error: updateError } = await supabase
			.from('inventory')
			.update({ quantity: newQuantity })
			.eq('id', inventoryId);

		if (updateError) {
			throw new Error('Failed to update inventory');
		}
	}

	revalidatePath('/inventory');
	return { success: true, newQuantity };
}

export async function removeInventoryItem(inventoryId: string) {
	const supabase = await createClerkSupabaseClient();

	// Delete the inventory item
	const { error } = await supabase
		.from('inventory')
		.delete()
		.eq('id', inventoryId);

	if (error) {
		throw new Error('Failed to remove inventory item');
	}

	// Revalidate the inventory page to refresh the data
	revalidatePath('/inventory');

	return { success: true };
}
