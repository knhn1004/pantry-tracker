'use client';
import { toast } from '@/components/ui/use-toast';
import supabaseClient from '@/lib/supabase/client';

export async function uploadAndProcess(image: File) {
	try {
		const formData = new FormData();
		formData.append('image', image);

		const { error } = await supabaseClient.functions.invoke(
			'load-inventory-from-image',
			{
				body: formData,
			}
		);

		if (error) {
			throw error;
		}

		toast({
			title: 'Image uploaded successfully',
			description: 'Your inventory has been updated.',
			variant: 'default',
		});
	} catch (error) {
		console.error('Error uploading image:', error);
		toast({
			title: 'Error uploading image',
			description: (error as Error).message,
			variant: 'destructive',
		});
	}
}
