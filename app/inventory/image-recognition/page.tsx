import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ImageUpload } from '../../../components/image-upload-form';
import CameraImage from '../../../components/camera-image-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { uploadAndProcess } from './upload';
import LoadingDialog from './loading-dialog';

export default async function Page() {
	return (
		<>
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
						<ImageUpload processFunc={uploadAndProcess} />
					</div>
					<div className="flex-1">
						<CameraImage processFunc={uploadAndProcess} />
					</div>
				</div>
				<div className="md:hidden mt-4">
					<Link
						href="/inventory"
						className="block w-full py-2 px-4 bg-gray-200 text-center rounded-md text-gray-700 font-medium"
					>
						Cancel
					</Link>
				</div>
			</div>
			<LoadingDialog />
		</>
	);
}
