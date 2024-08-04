import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Tables } from '@/database.types';

// You might want to create separate components for these
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function getRecipe(id: string) {
	const supabase = await createClerkSupabaseClient();

	const { data: recipe, error } = await supabase
		.from('recipes')
		.select(
			`
        *,
        recipe_ingredients (
          quantity,
          units (name),
          items (name)
        )
      `
		)
		.eq('id', id)
		.single();

	if (error || !recipe) {
		notFound();
	}

	return recipe as Tables<'recipes'> & {
		recipe_ingredients: {
			quantity: number;
			units: { name: string };
			items: { name: string };
		}[];
	};
}

export default async function RecipePage({
	params,
}: {
	params: { id: string };
}) {
	const recipe = await getRecipe(params.id);

	return (
		<div className="container mx-auto p-4">
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">{recipe.name}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-gray-600 mb-4">{recipe.description}</p>
					<div className="flex space-x-4 mb-4">
						<Badge variant="secondary">Servings: {recipe.servings}</Badge>
						<Badge variant="secondary">
							Prep Time: {recipe.prep_time} mins
						</Badge>
						<Badge variant="secondary">
							Cook Time: {recipe.cook_time} mins
						</Badge>
					</div>
					<h3 className="text-xl font-semibold mb-2">Ingredients:</h3>
					<ul className="list-disc pl-5 mb-4">
						{recipe.recipe_ingredients.map((ingredient, index) => (
							<li key={index}>
								{ingredient.quantity} {ingredient.units?.name}{' '}
								{ingredient.items.name}
							</li>
						))}
					</ul>
					<h3 className="text-xl font-semibold mb-2">Instructions:</h3>
					<p className="whitespace-pre-wrap">{recipe.instructions}</p>
				</CardContent>
			</Card>
		</div>
	);
}
