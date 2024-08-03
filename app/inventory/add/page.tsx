import { Suspense } from 'react';
import AddInventoryForm from './add-inventory-form';
import {
	fetchItems,
	fetchLocations,
	fetchUnits,
} from '@/lib/actions/inventory';

export default async function Page() {
	const [items, locations, units] = await Promise.all([
		fetchItems(),
		fetchLocations(),
		fetchUnits(),
	]);

	const data = {
		items,
		locations,
		units,
	};

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AddInventoryForm {...data} />;
		</Suspense>
	);
}
