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

			<h1>Image Recognition</h1>
			<div className="flex flex-col md:flex-row gap-4">
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
