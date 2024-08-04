import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Tables } from '@/database.types';

interface TrashRecipeDialogProps {
	isRemoveDialogOpen: boolean;
	setIsRemoveDialogOpen: (value: boolean) => void;
	selectedRecipe: Tables<'recipes'> | null;
	handleConfirmRemove: () => Promise<void>;
}

export default function TrashRecipeDialog({
	isRemoveDialogOpen,
	setIsRemoveDialogOpen,
	selectedRecipe,
	handleConfirmRemove,
}: TrashRecipeDialogProps) {
	return (
		<Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Recipe</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete the recipe{' '}
						<span className="font-bold">{selectedRecipe?.name}</span>? This
						action cannot be undone.
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
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
