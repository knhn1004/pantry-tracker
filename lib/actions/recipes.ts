'use server';
export const maxDuration = 30;

import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

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
      unit: units (id, name),
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
		itemId: item.item ? item.item.id : null,
		quantity: item.quantity,
		unitId: item?.unit?.id,
		unitName: item?.unit?.name,
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
			`${process.env.FLOWISE_BASE_URL}${process.env.FLOWISE_GENERATE_RECIPE_URL}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${process.env.FLOWISE_API_KEY}`,
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
			(ingredient: { id: string; quantity: any; unit_id: string }) => ({
				recipe_id: insertedRecipe.id,
				item_id: inventoryToItemIdMap[ingredient.id],
				quantity: ingredient.quantity,
				unit_id: ingredient.unit_id,
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
		revalidatePath('/recipes');
		return recipeData;
	} catch (error) {
		console.error('Error generating recipe: ', error);
	}
}

export async function fetchRecipes() {
	const supabase = await createClerkSupabaseClient();
	const { userId } = auth();

	if (!userId) {
		throw new Error('User not authenticated');
	}

	const { data, error } = await supabase
		.from('recipes')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching recipes:', error);
		throw new Error('Failed to fetch recipes');
	}

	return data;
}
export async function deleteRecipe(recipeId: string) {
	const supabase = await createClerkSupabaseClient();
	const { userId } = auth();

	if (!userId) {
		throw new Error('User not authenticated');
	}

	const { error } = await supabase
		.from('recipes')
		.delete()
		.eq('id', recipeId)
		.eq('user_id', userId);

	if (error) {
		console.error('Error deleting recipe:', error);
		throw new Error('Failed to delete recipe');
	}

	revalidatePath('/recipes');
}

export async function cookRecipe(recipeId: string) {
	const supabase = await createClerkSupabaseClient();

	try {
		const { data: recipe, error: recipeError } = await supabase
			.from('recipes')
			.select(
				`
        *,
        recipe_ingredients (
          quantity,
          unit_id,
          item_id,
          items (name)
        )
      `
			)
			.eq('id', recipeId)
			.single();

		if (recipeError || !recipe) {
			throw new Error(
				`Failed to fetch recipe: ${recipeError?.message || 'Recipe not found'}`
			);
		}

		// Check if we have enough inventory for all ingredients
		for (const ingredient of recipe.recipe_ingredients) {
			const { data: inventoryItems, error: inventoryError } = await supabase
				.from('inventory')
				.select('*')
				.eq('item_id', ingredient.item_id ?? '')
				.eq('unit_id', ingredient.unit_id ?? '')
				.order('expiration_date', { ascending: true });

			if (inventoryError) {
				throw new Error(
					`Failed to fetch inventory items: ${inventoryError.message}`
				);
			}

			const totalQuantity = inventoryItems.reduce(
				(sum, item) => sum + item.quantity,
				0
			);

			if (totalQuantity < ingredient.quantity) {
				throw new Error(
					`Not enough inventory for ingredient: ${ingredient.items?.name}`
				);
			}
		}

		// Update inventory for each ingredient
		for (const ingredient of recipe.recipe_ingredients) {
			let remainingQuantity = ingredient.quantity;

			const { data: inventoryItems, error: inventoryError } = await supabase
				.from('inventory')
				.select('*')
				.eq('item_id', ingredient.item_id ?? '')
				.eq('unit_id', ingredient.unit_id ?? '')
				.order('expiration_date', { ascending: true });

			if (inventoryError) {
				throw new Error(
					`Failed to fetch inventory items: ${inventoryError.message}`
				);
			}

			for (const inventoryItem of inventoryItems) {
				if (remainingQuantity <= 0) break;

				const quantityToRemove = Math.min(
					remainingQuantity,
					inventoryItem.quantity
				);
				const newQuantity = inventoryItem.quantity - quantityToRemove;

				if (newQuantity <= 0) {
					const { error: deleteError } = await supabase
						.from('inventory')
						.delete()
						.eq('id', inventoryItem.id);

					if (deleteError) {
						throw new Error(
							`Failed to delete inventory item: ${deleteError.message}`
						);
					}
				} else {
					const { error: updateError } = await supabase
						.from('inventory')
						.update({ quantity: newQuantity })
						.eq('id', inventoryItem.id);

					if (updateError) {
						throw new Error(
							`Failed to update inventory item: ${updateError.message}`
						);
					}
				}

				remainingQuantity -= quantityToRemove;
			}
		}

		revalidatePath('/inventory');

		return {
			success: true,
			message: 'Recipe cooked and inventory updated successfully.',
		};
	} catch (error) {
		return {
			success: false,
			message: (error as Error).message,
		};
	}
}
