'use client';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
	fetchItems,
	fetchLocations,
	fetchUnits,
	addInventoryItem,
} from '@/lib/actions/inventory';
import {
	Form,
	FormControl,
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
import { formSchema, type FormData } from './add-inventory-form';

export default function AddInventory() {
	const [items, setItems] = useState<{ id: string; name: string }[]>([]);
	const [locations, setLocations] = useState<{ id: string; name: string }[]>(
		[]
	);
	const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
	const [isNewItem, setIsNewItem] = useState(false);
	const [isNewLocation, setIsNewLocation] = useState(false);
	const [isNewUnit, setIsNewUnit] = useState(false);

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
		const loadData = async () => {
			try {
				const [itemsData, locationsData, unitsData] = await Promise.all([
					fetchItems(),
					fetchLocations(),
					fetchUnits(),
				]);
				setItems(itemsData);
				setLocations(locationsData);
				setUnits(unitsData);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};
		loadData();
	}, []);

	const onSubmit = async (data: FormData) => {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				formData.append(key, value.toString());
			}
		});

		try {
			await addInventoryItem(formData);
			// Reset form or show success message
			form.reset();
		} catch (error) {
			console.error('Error adding inventory item:', error);
			// Show error message to user
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
				<div className="flex items-center gap-4">
					{!isNewItem ? (
						<FormField
							control={control}
							name="itemId"
							render={({ field }) => (
								<FormItem className="flex-grow">
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
								<FormItem className="flex-grow">
									<FormLabel>New Item Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter new item name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					<Button
						type="button"
						onClick={() => setIsNewItem(!isNewItem)}
						className="self-end"
					>
						{isNewItem ? 'Select existing item' : 'Add new item'}
					</Button>
				</div>

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
				<div className="flex items-center gap-4">
					{!isNewUnit ? (
						<FormField
							control={control}
							name="unitId"
							render={({ field }) => (
								<FormItem className="flex-grow">
									<FormLabel>Select Unit</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a unit" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{units.map(unit => (
												<SelectItem key={unit.id} value={unit.id}>
													{unit.name}
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
							name="newUnitName"
							render={({ field }) => (
								<FormItem className="flex-grow">
									<FormLabel>New Unit Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter new unit name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					<Button
						type="button"
						onClick={() => setIsNewUnit(!isNewUnit)}
						className="self-end"
					>
						{isNewUnit ? 'Select existing unit' : 'Add new unit'}
					</Button>
				</div>

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
				<div className="flex items-center gap-4">
					{!isNewLocation ? (
						<FormField
							control={control}
							name="locationId"
							render={({ field }) => (
								<FormItem className="flex-grow">
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
								<FormItem className="flex-grow">
									<FormLabel>New Location Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter new location name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					<Button
						type="button"
						onClick={() => setIsNewLocation(!isNewLocation)}
						className="self-end"
					>
						{isNewLocation ? 'Select existing location' : 'Add new location'}
					</Button>
				</div>

				<Button type="submit" className="w-full">
					Add to Inventory
				</Button>
			</form>
		</Form>
	);
}
