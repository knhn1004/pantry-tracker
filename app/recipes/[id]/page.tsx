import { notFound } from 'next/navigation';
import { Tables } from '@/database.types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { createClerkSupabaseClient } from '@/lib/supabase/server';
import CookRecipeButton from './cook-recipe-button';

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
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/recipes">Recipes</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{recipe?.name}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<Card className="mb-6">
				<CardHeader>
					<div className="flex justify-between items-center">
						<CardTitle className="text-2xl font-bold">{recipe.name}</CardTitle>
						<CookRecipeButton recipeId={recipe.id} />
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-gray-600 mb-4 dark:text-slate-200">
						{recipe.description}
					</p>
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
								{ingredient.items?.name}
							</li>
						))}
					</ul>
					<h3 className="text-xl font-semibold mb-2">Instructions:</h3>
					<p className="whitespace-pre-wrap text-gray-400">
						{recipe.instructions}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
