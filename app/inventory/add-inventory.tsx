'use client';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const formSchema = z.object({
	itemId: z.string().optional(),
	newItemName: z.string().optional(),
	quantity: z.number().min(1, 'Quantity must be at least 1'),
	expirationDate: z.string().optional(),
	location: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddInventory() {
	const [items, setItems] = useState<{ id: string; name: string }[]>([]);
	const [isNewItem, setIsNewItem] = useState(false);
	const supabase = createClientComponentClient();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});

	useEffect(() => {
		const fetchItems = async () => {
			const { data, error } = await supabase.from('items').select('id, name');
			if (data) setItems(data);
			if (error) console.error('Error fetching items:', error);
		};
		fetchItems();
	}, [supabase]);

	const selectedItemId = watch('itemId');

	const onSubmit = async (data: FormData) => {
		let itemId = data.itemId;

		if (isNewItem && data.newItemName) {
			// Add new item to the items table
			const { data: newItem, error } = await supabase
				.from('items')
				.insert({ name: data.newItemName })
				.select('id')
				.single();

			if (error) {
				console.error('Error adding new item:', error);
				return;
			}
			itemId = newItem.id;
		}

		// Add to inventory
		const { error } = await supabase.from('inventories').insert({
			item_id: itemId,
			quantity: data.quantity,
			expiration_date: data.expirationDate || null,
			location: data.location || null,
		});

		if (error) {
			console.error('Error adding to inventory:', error);
		} else {
			console.log('Successfully added to inventory');
			// Reset form or navigate away
		}
	};

	return (
		<div>
			<h1>Add Inventory</h1>
			<form onSubmit={handleSubmit(onSubmit)}>
				{!isNewItem ? (
					<select {...register('itemId')}>
						<option value="">Select an item</option>
						{items.map(item => (
							<option key={item.id} value={item.id}>
								{item.name}
							</option>
						))}
					</select>
				) : (
					<input {...register('newItemName')} placeholder="New item name" />
				)}
				<button type="button" onClick={() => setIsNewItem(!isNewItem)}>
					{isNewItem ? 'Select existing item' : 'Add new item'}
				</button>
				<input
					{...register('quantity', { valueAsNumber: true })}
					placeholder="Quantity"
					type="number"
				/>
				{errors.quantity && <span>{errors.quantity.message}</span>}
				<input
					{...register('expirationDate')}
					placeholder="Expiration Date"
					type="date"
				/>
				<input {...register('location')} placeholder="Location" />
				<button type="submit">Add to Inventory</button>
			</form>
		</div>
	);
}
