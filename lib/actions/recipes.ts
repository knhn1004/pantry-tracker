'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function generateRecipeWithAI() {
	const supabase = await createClerkSupabaseClient();

	const { data, error } = await supabase
		.from('inventory')
		.select(
			`
      id,
      quantity,
      expiration_date,
      item: items (id, name),
      unit: units (id, name, abbreviation),
      location: locations (id, name)
    `
		)
		.order('expiration_date', { ascending: true });

	if (error) {
		console.error('Failed to fetch inventory:', error);
		return;
	}

	const formattedInventory = data.map(item => ({
		id: item.id,
		itemName: item.item ? item.item.name : '',
		itemId: item.item ? item.item.id : null, // Store the actual item ID
		quantity: item.quantity,
		unit: item?.unit?.abbreviation || item?.unit?.name,
		location: item?.location?.name,
		expirationDate: item.expiration_date,
	}));

	// Create a mapping of inventory IDs to item IDs
	const inventoryToItemIdMap = Object.fromEntries(
		formattedInventory.map(item => [item.id, item.itemId])
	);

	const question = JSON.stringify(formattedInventory);
	try {
		const response = await fetch(
			`${process.env.FLOWISE_BASE_URL}/api/v1/prediction/f19479b5-dfea-4255-9f01-09f90bbbc7ed`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ question }),
			}
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		const recipeData = {
			...result.json,
			ingredients: JSON.parse(result.json.ingredients),
		};

		const { userId } = auth();
		const { data: insertedRecipe, error: recipeError } = await supabase
			.from('recipes')
			.insert({
				user_id: userId!,
				name: recipeData.recipeName,
				description: recipeData.description,
				instructions: recipeData.steps,
				servings: recipeData.serving,
				prep_time: recipeData.prepTime,
				cook_time: recipeData.cookTime,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (recipeError) {
			console.error('Error storing recipe:', recipeError);
			throw recipeError;
		}

		// Store recipe ingredients
		const recipeIngredients = recipeData.ingredients.map(
			(ingredient: { id: string | number; quantity: any }) => ({
				recipe_id: insertedRecipe.id,
				item_id: inventoryToItemIdMap[ingredient.id], // Use the mapped item ID
				quantity: ingredient.quantity,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
		);

		const { error: ingredientsError } = await supabase
			.from('recipe_ingredients')
			.insert(recipeIngredients);

		if (ingredientsError) {
			console.error('Error storing recipe ingredients:', ingredientsError);
			throw ingredientsError;
		}

		console.log('Recipe stored successfully:', recipeData);
		return recipeData;
	} catch (error) {
		console.error('Error generating recipe: ', error);
	}
}
