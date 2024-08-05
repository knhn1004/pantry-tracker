'use client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useImageProcessingStore } from '@/lib/store/image-process.store';
import { Loader2 } from 'lucide-react';

export default function LoadingDialog() {
	const { processing, setProcessing } = useImageProcessingStore(state => state);
	return (
		<Dialog open={processing} onOpenChange={setProcessing}>
			<DialogContent className="sm:max-w-[425px]">
				<div className="flex flex-col items-center justify-center p-4">
					<Loader2 className="h-8 w-8 animate-spin mb-4" />
					<p className="text-center text-lg font-semibold">
						Analyzing your image...
					</p>
					<p className="text-center text-sm text-muted-foreground mt-2">
						Our AI is identifying ingredients for you!
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}