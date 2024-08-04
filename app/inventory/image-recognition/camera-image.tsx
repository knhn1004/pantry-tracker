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

type FormData = {
	photo: File | null;
};

const CameraImage: React.FC = () => {
	const { register, handleSubmit, setValue } = useForm<FormData>();
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

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
				const dataUrl = canvas.toDataURL('image/jpeg');
				setPreview(dataUrl);

				// Convert data URL to File object
				fetch(dataUrl)
					.then(res => res.blob())
					.then(blob => {
						const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
						setValue('photo', file);
					});
			}
		}
		stopCamera();
	};

	const onSubmit = (data: FormData) => {
		console.log('Uploaded file:', data.photo);
		// Here you would typically send the file to your server
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
					<img src={preview} alt="Captured" className="w-full h-auto" />
				)}
				{!stream && !preview && (
					<div className="w-full h-48 bg-gray-200 flex items-center justify-center">
						Camera preview
					</div>
				)}
				<canvas ref={canvasRef} style={{ display: 'none' }} />
			</CardContent>
			<CardFooter className="flex flex-col gap-2">
				{!stream && !preview && (
					<Button onClick={startCamera}>Start Camera</Button>
				)}
				{stream && (
					<>
						<Button onClick={capturePhoto}>Take Photo</Button>
						<Button onClick={stopCamera} variant="destructive">
							Stop Camera
						</Button>
					</>
				)}
				{preview && (
					<form onSubmit={handleSubmit(onSubmit)} className="w-full">
						<input type="hidden" {...register('photo')} />
						<Button type="submit" className="w-full">
							Upload Photo
						</Button>
					</form>
				)}
			</CardFooter>
		</Card>
	);
};

export default CameraImage;
