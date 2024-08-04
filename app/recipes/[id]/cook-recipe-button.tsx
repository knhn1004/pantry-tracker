'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cookRecipe } from '@/lib/actions/recipes';
import { UtensilsCrossed } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function CookRecipeButton({ recipeId }: { recipeId: string }) {
	const [isLoading, setIsLoading] = useState(false);

	const handleCookRecipe = async () => {
		setIsLoading(true);
		const result = await cookRecipe(recipeId);
		if (result.success) {
			toast({
				title: 'Success',
				description: result.message,
			});
		} else {
			toast({
				title: 'Error',
				description: result.message,
				variant: 'destructive',
			});
		}
		setIsLoading(false);
	};

	return (
		<Button
			onClick={handleCookRecipe}
			className="flex items-center space-x-2"
			disabled={isLoading}
		>
			<UtensilsCrossed className="w-4 h-4" />
			<span>{isLoading ? 'Cooking...' : 'Cook This Recipe'}</span>
		</Button>
	);
}
