'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateInventory() {
	revalidatePath('/inventory');
}
