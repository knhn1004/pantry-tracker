import { fetchRecipes } from '@/lib/actions/recipes';
import RecipeGeneration from './recipe-generation';
import RecipeTable from './recipe-table';

export default async function Recipe() {
	const recipeData = await fetchRecipes();
	return (
		<>
			<RecipeGeneration />
			<RecipeTable data={recipeData} />
		</>
	);
}
