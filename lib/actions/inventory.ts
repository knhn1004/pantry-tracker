'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

export async function fetchItems() {
	const supabase = await createClerkSupabaseClient();
	const { data, error } = await supabase.from('items').select('id, name');
	if (error) throw new Error('Failed to fetch items');
	return data;
}

export async function fetchLocations() {
	const supabase = await createClerkSupabaseClient();
	const { data, error } = await supabase.from('locations').select('id, name');
	if (error) throw new Error('Failed to fetch locations');
	return data;
}

export async function fetchUnits() {
	const supabase = await createClerkSupabaseClient();
	const { data, error } = await supabase.from('units').select('id, name');
	if (error) throw new Error('Failed to fetch units');
	return data;
}

export async function addInventoryItem(formData: FormData) {
	const supabase = await createClerkSupabaseClient();
	const { userId } = auth();

	const itemId = formData.get('itemId') as string;
	const newItemName = formData.get('newItemName') as string;
	const quantity = parseFloat(formData.get('quantity') as string);
	const unitId = formData.get('unitId') as string;
	const newUnitName = formData.get('newUnitName') as string;
	const expirationDate = formData.get('expirationDate') as string;
	const locationId = formData.get('locationId') as string;
	const newLocationName = formData.get('newLocationName') as string;

	let finalItemId = itemId;
	let finalUnitId = unitId;
	let finalLocationId = locationId;

	if (!itemId && newItemName) {
		const { data: newItem, error } = await supabase
			.from('items')
			.insert({ name: newItemName, user_id: userId! })
			.select('id')
			.single();
		if (error) throw new Error('Failed to add new item');
		finalItemId = newItem.id;
	}

	if (!unitId && newUnitName) {
		const { data: newUnit, error } = await supabase
			.from('units')
			.insert({ name: newUnitName, user_id: userId! })
			.select('id')
			.single();
		if (error) throw new Error('Failed to add new unit');
		finalUnitId = newUnit.id;
	}

	if (!locationId && newLocationName) {
		const { data: newLocation, error } = await supabase
			.from('locations')
			.insert({ name: newLocationName, user_id: userId! })
			.select('id')
			.single();
		if (error) throw new Error('Failed to add new location');
		finalLocationId = newLocation.id;
	}

	const { error } = await supabase.from('inventory').insert({
		item_id: finalItemId,
		quantity,
		unit_id: finalUnitId,
		expiration_date: expirationDate || null,
		location_id: finalLocationId,
		user_id: userId!,
	});

	if (error) throw new Error('Failed to add inventory item');

	revalidatePath('/inventory');
}
