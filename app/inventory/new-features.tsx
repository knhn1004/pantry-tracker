'use client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Camera, ScanLine } from 'lucide-react';

export default function NewFeatures() {
	const handleComingSoon = () => {
		toast({
			title: 'Coming Soon...',
			description: 'This feature is not yet available.',
		});
	};
	return (
		<>
			<Button className="ml-2" onClick={handleComingSoon} variant="outline">
				<ScanLine className="mr-2 h-4 w-4" />
				Scan Receipt
			</Button>
		</>
	);
}
