import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ImageUpload } from './image-upload';
import CameraImage from './camera-image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function Page() {
	return (
		<div className="container mx-auto p-4">
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/inventory">Inventory</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Image Recognition</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						Image Recognition
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="mb-4 text-sm text-muted-foreground">
						Upload your inventory image or take a picture with your camera to
						get started.
					</p>
				</CardContent>
			</Card>
			<div className="flex flex-col md:flex-row gap-4 py-4">
				<div className="flex-1">
					<ImageUpload />
				</div>
				<div className="flex-1">
					<CameraImage />
				</div>
			</div>
		</div>
	);
}
