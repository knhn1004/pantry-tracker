import { Button } from '@/components/ui/button';
import { fetchItemsWithInventory } from '@/lib/actions/items';
import Link from 'next/link';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function Inventory() {
	const itemsWithInventory = await fetchItemsWithInventory();

	return (
		<div className="container mx-auto p-4">
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">Inventory</CardTitle>
				</CardHeader>
				<CardContent>
					<Link href="/inventory/add">
						<Button>Add New</Button>
					</Link>
				</CardContent>
			</Card>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Item Name</TableHead>
						<TableHead>Quantity</TableHead>
						<TableHead>Unit</TableHead>
						<TableHead>Location</TableHead>
						<TableHead>Expiration Date</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{itemsWithInventory.map(item =>
						item.inventory.map(inv => (
							<TableRow key={inv.id}>
								<TableCell>{item.name}</TableCell>
								<TableCell>{inv.quantity}</TableCell>
								<TableCell>{inv.unit?.name || '-'}</TableCell>
								<TableCell>{inv.location?.name || '-'}</TableCell>
								<TableCell>
									{inv.expiration_date ? (
										<Badge
											variant={getExpirationBadgeVariant(inv.expiration_date)}
										>
											{new Date(inv.expiration_date).toLocaleDateString()}
										</Badge>
									) : (
										<Badge variant="outline">N/A</Badge>
									)}
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}

function getExpirationBadgeVariant(
	date: string
): 'default' | 'outline' | 'destructive' {
	const expirationDate = new Date(date);
	const today = new Date();
	const diffTime = expirationDate.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays <= 0) {
		return 'destructive';
	} else if (diffDays <= 7) {
		return 'default';
	} else {
		return 'outline';
	}
}
