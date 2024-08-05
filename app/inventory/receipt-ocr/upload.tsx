'use client';
import { toast } from '@/components/ui/use-toast';
import supabaseClient from '@/lib/supabase/client';

export async function uploadAndProcessReceipt(receipt: File) {
	try {
		const formData = new FormData();
		formData.append('receipt', receipt);

		const { error } = await supabaseClient.functions.invoke(
			'process-receipt-ocr',
			{
				body: formData,
			}
		);

		if (error) {
			throw error;
		}

		toast({
			title: 'Receipt processed successfully',
			description: 'Your inventory has been updated based on the receipt.',
			variant: 'default',
		});
	} catch (error) {
		console.error('Error processing receipt:', error);
		toast({
			title: 'Error processing receipt',
			description: (error as Error).message,
			variant: 'destructive',
		});
	}
}
