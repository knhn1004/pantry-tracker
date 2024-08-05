import { fetchItemsWithInventory } from '@/lib/actions/items';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import InventoryTable from './inventory-table'; // This will be our client component
import { Camera, PlusCircle, ScanLine } from 'lucide-react';

export default async function Inventory() {
	const itemsWithInventory = await fetchItemsWithInventory();

	const data = itemsWithInventory.flatMap(item =>
		item.inventory.map(inv => ({
			id: inv.id,
			itemName: item.name,
			quantity: inv.quantity,
			unit: inv.unit?.name || '',
			location: inv.location?.name || '',
			expirationDate: inv.expiration_date || '',
			category: item.category?.name || '',
		}))
	);

	return (
		<>
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">Inventory</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="mb-4 text-sm text-muted-foreground">
						Smart inventory management with AI auto categorization, image
						recognition, and receipt OCR
					</p>
					<Link href="/inventory/add">
						<Button>
							<PlusCircle className="mr-2 h-4 w-4" />
							Add New
						</Button>
					</Link>
					<Link href="/inventory/receipt-ocr">
						<Button className="ml-2" variant="outline">
							<ScanLine className="mr-2 h-4 w-4" />
							Scan Receipt
						</Button>
					</Link>
					<Link href="/inventory/image-recognition">
						<Button className="ml-2" variant="outline">
							<Camera className="mr-2 h-4 w-4" />
							Take/Upload Photo
						</Button>
					</Link>
				</CardContent>
			</Card>

			<InventoryTable data={data} />
		</>
	);
}
