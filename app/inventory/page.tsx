import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Inventory() {
	return (
		<div>
			<h1>Inventory</h1>
			<Link href="/inventory/add">
				<Button>Add New</Button>
			</Link>
		</div>
	);
}
