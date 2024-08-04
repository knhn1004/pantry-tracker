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
		const { data, error: uploadError } = await supabase.storage
			.from(bucketName)
			.upload(filePath, file, {
				upsert: true,
			});

		if (uploadError) throw uploadError;

		return new Response(
			JSON.stringify({ success: true, filePath: data.path }),
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
