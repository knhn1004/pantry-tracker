'use client';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import supabaseClient from '@/lib/supabase/client';
import { useUser } from '@clerk/nextjs';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const formSchema = z
	.object({
		itemId: z.string().optional(),
		newItemName: z
			.string()
			.min(2, 'Item name must be at least 2 characters')
			.optional(),
		quantity: z.number().min(1, 'Quantity must be at least 1'),
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
	);

type FormData = z.infer<typeof formSchema>;

export default function AddInventory() {
	const [items, setItems] = useState<{ id: string; name: string }[]>([]);
	const [locations, setLocations] = useState<{ id: string; name: string }[]>(
		[]
	);
	const [isNewItem, setIsNewItem] = useState(false);
	const [isNewLocation, setIsNewLocation] = useState(false);
	const { user } = useUser();

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
		control,
	} = form;

	useEffect(() => {
		const fetchItemsAndLocations = async () => {
			const { data: itemsData, error: itemsError } = await supabaseClient
				.from('items')
				.select('id, name');
			if (itemsData) setItems(itemsData);
			if (itemsError) console.error('Error fetching items:', itemsError);

			const { data: locationsData, error: locationsError } =
				await supabaseClient.from('locations').select('id, name');
			if (locationsData) setLocations(locationsData);
			if (locationsError)
				console.error('Error fetching locations:', locationsError);
		};
		fetchItemsAndLocations();
	}, [supabaseClient]);

	const selectedItemId = watch('itemId');
	const selectedLocationId = watch('locationId');

	const onSubmit = async (data: FormData) => {
		let itemId = data.itemId;
		let locationId = data.locationId;

		if (isNewItem && data.newItemName) {
			const { data: newItem, error } = await supabaseClient
				.from('items')
				.insert({ name: data.newItemName, user_id: user!.id })
				.select('id')
				.single();

			if (error) {
				console.error('Error adding new item:', error);
				return;
			}
			itemId = newItem.id;
		}

		if (isNewLocation && data.newLocationName) {
			const { data: newLocation, error } = await supabaseClient
				.from('locations')
				.insert({ name: data.newLocationName, user_id: user!.id })
				.select('id')
				.single();

			if (error) {
				console.error('Error adding new location:', error);
				return;
			}
			locationId = newLocation.id;
		}

		const { error } = await supabaseClient.from('inventory').insert({
			item_id: itemId,
			quantity: data.quantity,
			expiration_date: data.expirationDate || null,
			location_id: locationId,
			user_id: user!.id,
		});

		if (error) {
			console.error('Error adding to inventory:', error);
		} else {
			console.log('Successfully added to inventory');
			// Reset form or navigate away
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
				{!isNewItem ? (
					<FormField
						control={control}
						name="itemId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Select Item</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select an item" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{items.map(item => (
											<SelectItem key={item.id} value={item.id}>
												{item.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : (
					<FormField
						control={control}
						name="newItemName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>New Item Name</FormLabel>
								<FormControl>
									<Input placeholder="Enter new item name" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<Button type="button" onClick={() => setIsNewItem(!isNewItem)}>
					{isNewItem ? 'Select existing item' : 'Add new item'}
				</Button>

				<FormField
					control={control}
					name="quantity"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Quantity</FormLabel>
							<FormControl>
								<Input
									type="number"
									{...field}
									onChange={e => field.onChange(+e.target.value)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="expirationDate"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Expiration Date</FormLabel>
							<FormControl>
								<Input type="date" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{!isNewLocation ? (
					<FormField
						control={control}
						name="locationId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Select Location</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a location" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{locations.map(location => (
											<SelectItem key={location.id} value={location.id}>
												{location.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : (
					<FormField
						control={control}
						name="newLocationName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>New Location Name</FormLabel>
								<FormControl>
									<Input placeholder="Enter new location name" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<Button type="button" onClick={() => setIsNewLocation(!isNewLocation)}>
					{isNewLocation ? 'Select existing location' : 'Add new location'}
				</Button>

				<Button type="submit">Add to Inventory</Button>
			</form>
		</Form>
	);
}
