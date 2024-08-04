'use client';
import { toast } from '@/components/ui/use-toast';
import supabaseClient from '@/lib/supabase/client';

export async function uploadAndProcess(image: File) {
	try {
		const formData = new FormData();
		formData.append('image', image);

		const { data, error } = await supabaseClient.functions.invoke(
			'load-inventory-from-image',
			{
				body: formData,
				headers: {
					// Remove the Content-Type header
					// Let the browser set it automatically with the correct boundary
				},
			}
		);

		if (error) {
			throw error;
		}

		// Handle successful upload and processing here
		console.log('Function response:', data);
		toast({
			title: 'Image uploaded successfully',
			description: 'Your inventory has been updated.',
			variant: 'default',
		});

		return data;
	} catch (error) {
		console.error('Error uploading image:', error);
		toast({
			title: 'Error uploading image',
			description: 'Please try again later.',
			variant: 'destructive',
		});
		throw error;
	}
}
