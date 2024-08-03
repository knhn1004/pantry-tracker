import { z } from 'zod';

export const formSchema = z
	.object({
		itemId: z.string().optional(),
		newItemName: z
			.string()
			.min(2, 'Item name must be at least 2 characters')
			.optional(),
		quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
		unitId: z.string().optional(),
		newUnitName: z
			.string()
			.min(1, 'Unit name must be at least 1 character')
			.optional(),
		expirationDate: z.string().optional(),
		locationId: z.string().optional(),
		newLocationName: z
			.string()
			.min(2, 'Location name must be at least 2 characters')
			.optional(),
	})
	.refine(
		data =>
			(data.itemId && !data.newItemName) || (!data.itemId && data.newItemName),
		{
			message: 'Either select an existing item or provide a new item name',
			path: ['itemId', 'newItemName'],
		}
	)
	.refine(
		data =>
			(data.locationId && !data.newLocationName) ||
			(!data.locationId && data.newLocationName),
		{
			message:
				'Either select an existing location or provide a new location name',
			path: ['locationId', 'newLocationName'],
		}
	)
	.refine(
		data =>
			(data.unitId && !data.newUnitName) || (!data.unitId && data.newUnitName),
		{
			message: 'Either select an existing unit or provide a new unit name',
			path: ['unitId', 'newUnitName'],
		}
	);

export type FormData = z.infer<typeof formSchema>;
