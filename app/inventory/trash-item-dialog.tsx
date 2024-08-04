import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { InventoryItem } from './inventory-table';

interface TrashItemDialogProps {
	isRemoveDialogOpen: boolean;
	setIsRemoveDialogOpen: (value: boolean) => void;
	selectedItem: InventoryItem | null;
	handleConfirmRemove: () => Promise<void>;
}

export default function TrashItemDialog({
	isRemoveDialogOpen,
	setIsRemoveDialogOpen,
	selectedItem,
	handleConfirmRemove,
}: TrashItemDialogProps) {
	return (
		<Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Remove Item</DialogTitle>
					<DialogDescription>
						Are you sure you want to remove{' '}
						<span className="font-bold">{selectedItem?.itemName}</span> from the
						inventory?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setIsRemoveDialogOpen(false)}
					>
						Cancel
					</Button>
					<Button variant="destructive" onClick={handleConfirmRemove}>
						Remove
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
