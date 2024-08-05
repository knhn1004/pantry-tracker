import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async req => {
	const payload = await req.json();
	const { record, type } = payload;

	if (type === 'INSERT' && record && record.id) {
		try {
			// Make API call to get category
			const url = `${Deno.env.get(
				'FLOWISE_API_BASE_URL'
			)}/api/v1/prediction/${Deno.env.get('FLOWISE_API_CATEGORIZER_ENDPOINT')}`;
			const apiResponse = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Deno.env.get('FLOWISE_API_KEY')}`,
				},
				body: JSON.stringify({ question: record.name }),
			});
			const {
				json: { category: categoryName },
			} = await apiResponse.json();

			// Check if category exists
			let { data: existingCategory, error: categoryError } = await supabase
				.from('categories')
				.select('id')
				.eq('name', categoryName)
				.eq('user_id', record.user_id)
				.single();

			if (categoryError && categoryError.code === 'PGRST116') {
				// Category doesn't exist, create it
				const { data: newCategory, error: createError } = await supabase
					.from('categories')
					.insert({ name: categoryName, user_id: record.user_id })
					.select('id')
					.single();

				if (createError) throw createError;
				existingCategory = newCategory;
			} else if (categoryError) {
				throw categoryError;
			}

			// Update item with category_id
			if (existingCategory) {
				const { error: updateError } = await supabase
					.from('items')
					.update({ category_id: existingCategory.id })
					.eq('id', record.id);

				if (updateError) throw updateError;
			} else {
				console.error('No category found for item:', record.name);
			}

			return new Response(JSON.stringify({ success: true }), {
				headers: { 'Content-Type': 'application/json' },
				status: 200,
			});
		} catch (error) {
			console.error('Error processing item:', error);
			return new Response(
				JSON.stringify({ success: false, error: error.message }),
				{
					headers: { 'Content-Type': 'application/json' },
					status: 500,
				}
			);
		}
	}

	return new Response(JSON.stringify({ success: true }), {
		headers: { 'Content-Type': 'application/json' },
		status: 200,
	});
});
