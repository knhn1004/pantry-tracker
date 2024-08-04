'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateRecipeWithAI } from '@/lib/actions/recipes';
import { Wand2 } from 'lucide-react'; // Import the magic wand icon

export default function Recipes() {
	return (
		<div className="container mx-auto p-4">
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">Inventory</CardTitle>
				</CardHeader>
				<CardContent>
					<Button
						onClick={() => {
							generateRecipeWithAI();
						}}
					>
						<Wand2 className="mr-2 h-4 w-4" /> {/* Add the icon here */}
						Generate Recipe with AI
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
