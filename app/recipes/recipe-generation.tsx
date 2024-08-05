'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateRecipeWithAI } from '@/lib/actions/recipes';
import { Wand2 } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export default function RecipeGeneration() {
	const [isLoading, setIsLoading] = useState(false);

	const handleGenerateRecipe = async () => {
		setIsLoading(true);
		const response = await generateRecipeWithAI();
		const success = response?.success;
		const message = response?.message;
		if (success) {
			toast({
				title: 'Success',
				description: 'Recipe generated successfully!',
			});
		} else {
			toast({
				title: 'Error',
				description: message || 'An unknown error occurred',
				variant: 'destructive',
			});
		}
		setIsLoading(false);
	};

	return (
		<>
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">Recipes</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="mb-4 text-sm text-muted-foreground">
						Our AI generates a recipe that prioritizes your near-expiry
						ingredients and helps reduce food waste.
					</p>
					<Button onClick={handleGenerateRecipe}>
						<Wand2 className="mr-2 h-4 w-4" />
						Generate Smart Recipe
					</Button>
				</CardContent>
			</Card>

			<Dialog open={isLoading} onOpenChange={setIsLoading}>
				<DialogContent className="sm:max-w-[425px]">
					<VisuallyHidden>
						<DialogTitle>Recipe Generation</DialogTitle>
					</VisuallyHidden>
					<DialogDescription asChild>
						<div className="flex flex-col items-center justify-center p-4">
							<Loader2 className="h-8 w-8 animate-spin mb-4" />
							<p className="text-center text-lg font-semibold">
								Cooking up your recipe...
							</p>
							<p className="text-center text-sm text-muted-foreground mt-2">
								Our AI chef is stirring the pot of creativity!
							</p>
						</div>
					</DialogDescription>
				</DialogContent>
			</Dialog>
		</>
	);
}
