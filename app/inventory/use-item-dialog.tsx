import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface UseItemDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (quantity: number) => Promise<void>;
	itemName: string;
	maxQuantity: number;
}

export default function UseItemDialog({
	isOpen,
	onClose,
	onConfirm,
	itemName,
	maxQuantity,
}: UseItemDialogProps) {
	const [quantity, setQuantity] = useState(1);

	const handleConfirm = async () => {
		await onConfirm(quantity);
		onClose();
	};

	useEffect(() => {
		if (isOpen) {
			setQuantity(maxQuantity);
		}
	}, [isOpen]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Use {itemName}</DialogTitle>
					<DialogDescription>
						How many {itemName}(s) do you want to use?
					</DialogDescription>
				</DialogHeader>
				<Input
					type="number"
					value={quantity}
					onChange={e =>
						setQuantity(
							Math.min(Math.max(1, parseInt(e.target.value) || 1), maxQuantity)
						)
					}
					min={1}
					max={maxQuantity}
				/>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleConfirm}>Confirm</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
