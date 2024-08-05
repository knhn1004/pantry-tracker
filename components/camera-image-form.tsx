'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { CameraIcon, ImageIcon, UploadIcon, XIcon } from 'lucide-react';
import { useImageProcessingStore } from '@/lib/store/image-process.store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type FormData = {
	photo: File | null;
};

const CameraImage = ({
	processFunc,
}: {
	processFunc: (file: File) => Promise<any>;
}) => {
	const { register, handleSubmit, setValue } = useForm<FormData>();
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { setProcessing } = useImageProcessingStore();

	useEffect(() => {
		if (videoRef.current && stream) {
			videoRef.current.srcObject = stream;
		}
	}, [stream]);

	const startCamera = async () => {
		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia({
				video: true,
			});
			setStream(mediaStream);
		} catch (error) {
			console.error('Error accessing camera:', error);
		}
	};

	const stopCamera = () => {
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
			setStream(null);
		}
	};

	const capturePhoto = () => {
		if (videoRef.current && canvasRef.current) {
			const video = videoRef.current;
			const canvas = canvasRef.current;
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			const context = canvas.getContext('2d');
			if (context) {
				context.drawImage(video, 0, 0, canvas.width, canvas.height);
				canvas.toBlob(blob => {
					if (blob) {
						const file = new File([blob], `photo_${Date.now()}.jpg`, {
							type: 'image/jpeg',
						});
						setValue('photo', file);
						setPreview(URL.createObjectURL(file));
					}
				}, 'image/jpeg');
			}
		}
		stopCamera();
	};
	const resetPreview = () => {
		setPreview(null);
		setValue('photo', null);
	};
	const router = useRouter();

	const onSubmit = async (data: FormData) => {
		if (!data.photo) return;
		setProcessing(true);
		await processFunc(data.photo);
		setProcessing(false);
		router.push('/inventory');
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Camera Capture</CardTitle>
			</CardHeader>
			<CardContent>
				{stream && (
					<video
						ref={videoRef}
						autoPlay
						playsInline
						onLoadedMetadata={() => videoRef.current?.play()}
						className="w-full h-auto"
					/>
				)}
				{preview && (
					<Image
						src={preview}
						alt="Captured"
						className="w-full h-auto"
						width={500}
						height={500}
					/>
				)}
				{!stream && !preview && (
					<div className="w-full h-48 flex flex-col items-center justify-center">
						<ImageIcon className="h-12 w-12 mb-2 text-gray-400" />
						<span className="text-gray-500">Camera preview</span>
					</div>
				)}
				<canvas ref={canvasRef} style={{ display: 'none' }} />
			</CardContent>
			<CardFooter className="flex flex-col gap-2">
				{!stream && !preview && (
					<Button onClick={startCamera} className="w-full">
						<CameraIcon className="mr-2 h-4 w-4" />
						Start Camera
					</Button>
				)}
				{stream && (
					<>
						<Button onClick={capturePhoto} className="w-full">
							<CameraIcon className="mr-2 h-4 w-4" />
							Take Photo
						</Button>
						<Button
							onClick={stopCamera}
							className="w-full"
							variant="destructive"
						>
							<XIcon className="mr-2 h-4 w-4" />
							Stop Camera
						</Button>
					</>
				)}
				{preview && (
					<>
						<form onSubmit={handleSubmit(onSubmit)} className="w-full">
							<input type="hidden" {...register('photo')} />
							<Button type="submit" className="w-full mb-2">
								<UploadIcon className="mr-2 h-4 w-4" />
								Upload Photo
							</Button>
						</form>
						<Button
							onClick={() => {
								resetPreview();
								startCamera();
							}}
							variant="outline"
							className="w-full"
						>
							Retake Photo
						</Button>
					</>
				)}
			</CardFooter>
		</Card>
	);
};

export default CameraImage;
