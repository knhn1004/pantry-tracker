import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { decode, Payload } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers':
		'authorization, x-client-info, apikey, content-type',
};

interface ClerkJWTPayload extends Payload {
	sub?: string;
	// Add other expected fields from your Clerk JWT payload here
}

serve(async req => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}
	const authHeader = req.headers.get('Authorization');
	if (!authHeader) {
		return new Response(JSON.stringify({ error: 'No authorization header' }), {
			status: 401,
		});
	}

	const token = authHeader.replace('Bearer ', '');

	try {
		const supabase = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_ANON_KEY') ?? '',
			{
				global: {
					headers: { Authorization: req.headers.get('Authorization')! },
				},
			}
		);
		const [_, payload] = decode(token);
		const clerkPayload = payload as ClerkJWTPayload;
		const userId = clerkPayload.sub;

		if (!userId) {
			throw new Error('User ID not found in token');
		}

		const formData = await req.formData();
		const file = formData.get('image') as File;

		if (!file) {
			throw new Error('No image file provided');
		}

		const fileExt = file.name.split('.').pop();
		const fileName = `${crypto.randomUUID()}.${fileExt}`;
		const bucketName = 'images';
		const filePath = `${bucketName}/${userId}/${fileName}`;

		console.log(`uploading to ${filePath} ....`);
		const { error: uploadError } = await supabase.storage
			.from(bucketName)
			.upload(filePath, file, {
				upsert: true,
			});

		if (uploadError) throw uploadError;
		// Get the signed URL for the uploaded image
		const { data: urlData, error: urlError } = await supabase.storage
			.from(bucketName)
			.createSignedUrl(filePath, 3600); // URL valid for 1 hour

		if (urlError) throw urlError;

		const signedUrl = urlData.signedUrl;
		const FLOWISE_API_BASE_URL = Deno.env.get('FLOWISE_API_BASE_URL') ?? '';
		const FLOWISE_API_ENDPOINT =
			Deno.env.get('FLOWISE_API_IMAGE_RECOGNITION_ENDPOINT') ?? '';
		const FLOWISE_API_KEY = Deno.env.get('FLOWISE_API_KEY') ?? '';
		const API_URL = `${FLOWISE_API_BASE_URL}/api/v1/prediction/${FLOWISE_API_ENDPOINT}`;
		const headers = {
			Authorization: `Bearer ${FLOWISE_API_KEY}`,
			'Content-Type': 'application/json',
		};

		const apiResponse = await fetch(API_URL, {
			method: 'POST',
			headers: headers,
			body: JSON.stringify({
				question: '',
				uploads: [
					{
						name: fileName,
						type: 'url',
						data: signedUrl,
					},
				],
			}),
		});

		if (!apiResponse.ok) {
			throw new Error(`API request failed with status ${apiResponse.status}`);
		}

		const result = await apiResponse.json();
		const { item, quantity, unit } = result.json;
		// Check if unit exists in units table
		const { data: unitData, error: unitError } = await supabase
			.from('units')
			.select('id')
			.eq('name', unit)
			.single();

		if (unitError && unitError.code !== 'PGRST116') {
			throw unitError;
		}

		let unitId;
		if (!unitData) {
			// Create new unit if it doesn't exist
			const { data: newUnit, error: newUnitError } = await supabase
				.from('units')
				.insert({ name: unit, user_id: userId })
				.select()
				.single();

			if (newUnitError) throw newUnitError;
			unitId = newUnit.id;
		} else {
			unitId = unitData.id;
		}

		// Check if item exists in items table
		const { data: itemData, error: itemError } = await supabase
			.from('items')
			.select('id')
			.eq('name', item)
			.single();

		if (itemError && itemError.code !== 'PGRST116') {
			throw itemError;
		}

		let itemId;
		if (!itemData) {
			// Create new item if it doesn't exist
			const { data: newItem, error: newItemError } = await supabase
				.from('items')
				.insert({ name: item, user_id: userId })
				.select()
				.single();

			if (newItemError) throw newItemError;
			itemId = newItem.id;
		} else {
			itemId = itemData.id;
		}

		// Create inventory entry
		const { data: inventoryData, error: inventoryError } = await supabase
			.from('inventory')
			.insert({
				user_id: userId,
				item_id: itemId,
				unit_id: unitId,
				quantity: quantity,
			})
			.select()
			.single();

		if (inventoryError) throw inventoryError;

		return new Response(
			JSON.stringify({ success: true, data: inventoryData }),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				status: 200,
			}
		);
	} catch (error) {
		return new Response(
			JSON.stringify({ success: false, error: error.message }),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				status: 400,
			}
		);
	}
});
