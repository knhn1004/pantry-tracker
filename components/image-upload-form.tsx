'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
	FileUploader,
	FileUploaderContent,
	FileUploaderItem,
	FileInput,
} from '@/components/extension/file-upload';
import { Button } from '@/components/ui/button';
import { ImageIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useImageProcessingStore } from '@/lib/store/image-process.store';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
	image: z.instanceof(File).optional(),
});

const ImageSvgDraw = () => {
	return (
		<>
			<ImageIcon className="w-8 h-8 mb-3 text-muted-foreground" />
			<p className="mb-1 text-sm text-muted-foreground">
				<span className="font-semibold">Click to upload</span>
				&nbsp; or drag and drop
			</p>
			<p className="text-xs text-muted-foreground">
				PNG, JPG or GIF (MAX. 4MB)
			</p>
		</>
	);
};

export function ImageUpload({
	processFunc,
}: {
	processFunc: (file: File) => Promise<any>;
}) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			image: undefined,
		},
	});

	const dropZoneConfig = {
		maxFiles: 1,
		maxSize: 1024 * 1024 * 4, // 4MB
		accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
	};
	const setProcessing = useImageProcessingStore(state => state.setProcessing);

	const router = useRouter();
	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (values.image) {
			if (!values.image) return;
			setProcessing(true);
			await processFunc(values.image);
			setProcessing(false);
			router.push('/inventory');
		}
	};

	const handleRemoveImage = useCallback(() => {
		form.setValue('image', undefined);
		form.trigger('image');
	}, [form]);

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Image Upload</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="w-full max-w-sm"
					>
						<FormField
							control={form.control}
							name="image"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<FileUploader
											value={field.value ? [field.value] : null}
											onValueChange={files => {
												field.onChange(files ? files[0] : undefined);
												form.trigger('image');
											}}
											dropzoneOptions={dropZoneConfig}
											className="relative bg-background rounded-lg p-2"
										>
											<FileInput className="outline-dashed outline-1 outline-muted">
												<div className="flex items-center justify-center flex-col pt-3 pb-4 w-full h-48">
													<ImageSvgDraw />
												</div>
											</FileInput>
											<FileUploaderContent>
												{field.value && (
													<FileUploaderItem index={0} file={field.value}>
														<ImageIcon className="h-4 w-4 stroke-current mr-2" />
														<span>{field.value.name}</span>
													</FileUploaderItem>
												)}
											</FileUploaderContent>
										</FileUploader>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{form.watch('image') && (
							<Button
								type="button"
								onClick={handleRemoveImage}
								variant="outline"
								className="mt-2 w-full"
							>
								<Trash2Icon className="w-4 h-4 mr-2" />
								Remove Image
							</Button>
						)}
						<Button
							type="submit"
							className="mt-2 w-full"
							disabled={!form.watch('image')}
						>
							<UploadIcon className="w-4 h-4 mr-2" />
							Process Image for Inventory
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
