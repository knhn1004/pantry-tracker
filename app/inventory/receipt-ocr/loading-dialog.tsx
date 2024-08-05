'use client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { Loader2 } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useImageProcessingStore } from '@/lib/store/image-process.store';

export default function ReceiptOCRLoadingDialog() {
	const { processing, setProcessing } = useImageProcessingStore();
	return (
		<Dialog open={processing} onOpenChange={setProcessing}>
			<DialogContent className="sm:max-w-[425px]">
				<VisuallyHidden>
					<DialogTitle>Receipt OCR Processing</DialogTitle>
				</VisuallyHidden>
				<DialogDescription asChild>
					<div className="flex flex-col items-center justify-center p-4">
						<Loader2 className="h-8 w-8 animate-spin mb-4" />
						<p className="text-center text-lg font-semibold">
							Scanning your receipt...
						</p>
						<p className="text-center text-sm text-muted-foreground mt-2">
							Our OCR is extracting item details for you!
						</p>
					</div>
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
}
