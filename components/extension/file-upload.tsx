'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
	Dispatch,
	SetStateAction,
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import {
	useDropzone,
	DropzoneState,
	FileRejection,
	DropzoneOptions,
} from 'react-dropzone';
import { toast } from 'sonner';
import { Trash2 as RemoveIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import Image from 'next/image';

const FilePreview = ({ file }: { file: File }) => {
	const [preview, setPreview] = useState<string | null>(null);

	useEffect(() => {
		const objectUrl = URL.createObjectURL(file);
		setPreview(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [file]);

	if (!preview) {
		return null;
	}

	return (
		<div className="relative w-10 h-10 mr-2">
			<Image
				src={preview}
				alt="File preview"
				className="w-full h-full object-cover rounded"
				width={500}
				height={500}
			/>
		</div>
	);
};

type DirectionOptions = 'rtl' | 'ltr' | undefined;

type FileUploaderContextType = {
	dropzoneState: DropzoneState;
	isLOF: boolean;
	isFileTooBig: boolean;
	removeFileFromSet: (index: number) => void;
	activeIndex: number;
	setActiveIndex: Dispatch<SetStateAction<number>>;
	orientation: 'horizontal' | 'vertical';
	direction: DirectionOptions;
	value: File[] | null;
};

const FileUploaderContext = createContext<FileUploaderContextType | null>(null);

export const useFileUpload = () => {
	const context = useContext(FileUploaderContext);
	if (!context) {
		throw new Error('useFileUpload must be used within a FileUploaderProvider');
	}
	return context;
};

type FileUploaderProps = {
	value: File[] | null;
	reSelect?: boolean;
	onValueChange: (value: File[] | null) => void;
	dropzoneOptions: DropzoneOptions;
	orientation?: 'horizontal' | 'vertical';
};

export const FileUploader = forwardRef<
	HTMLDivElement,
	FileUploaderProps & React.HTMLAttributes<HTMLDivElement>
>(
	(
		{
			className,
			dropzoneOptions,
			value,
			onValueChange,
			reSelect,
			orientation = 'vertical',
			children,
			dir,
			...props
		},
		ref
	) => {
		const [isFileTooBig, setIsFileTooBig] = useState(false);
		const [isLOF, setIsLOF] = useState(false);
		const [activeIndex, setActiveIndex] = useState(-1);
		const {
			accept = {
				'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
			},
			maxFiles = 1,
			maxSize = 4 * 1024 * 1024,
			multiple = true,
		} = dropzoneOptions;

		const reSelectAll = maxFiles === 1 ? true : reSelect;
		const direction: DirectionOptions = dir === 'rtl' ? 'rtl' : 'ltr';

		const opts = dropzoneOptions
			? dropzoneOptions
			: { accept, maxFiles, maxSize, multiple };

		const onDrop = useCallback(
			(acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
				const files = acceptedFiles;

				if (!files) {
					toast.error('file error , probably too big');
					return;
				}

				let newValues: File[] = [];

				if (maxFiles === 1) {
					// If maxFiles is 1, always replace the existing file
					newValues = files.slice(0, 1);
				} else {
					// For multiple files, append to existing files up to maxFiles
					newValues = value ? [...value] : [];
					files.forEach(file => {
						if (newValues.length < maxFiles) {
							newValues.push(file);
						}
					});
				}

				onValueChange(newValues);

				if (rejectedFiles.length > 0) {
					for (let i = 0; i < rejectedFiles.length; i++) {
						if (rejectedFiles[i].errors[0]?.code === 'file-too-large') {
							toast.error(
								`File is too large. Max size is ${maxSize / 1024 / 1024}MB`
							);
							break;
						}
						if (rejectedFiles[i].errors[0]?.message) {
							toast.error(rejectedFiles[i].errors[0].message);
							break;
						}
					}
				}
			},
			[value, maxFiles, maxSize, onValueChange]
		);
		const dropzoneState = useDropzone({
			...opts,
			onDrop,
			onDropRejected: () => setIsFileTooBig(true),
			onDropAccepted: () => setIsFileTooBig(false),
		});
		const removeFileFromSet = useCallback(
			(i: number) => {
				if (!value) return;
				const newFiles = value.filter((_, index) => index !== i);
				onValueChange(newFiles);
			},
			[value, onValueChange]
		);

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<HTMLDivElement>) => {
				e.preventDefault();
				e.stopPropagation();

				if (!value) return;

				const moveNext = () => {
					const nextIndex = activeIndex + 1;
					setActiveIndex(nextIndex > value.length - 1 ? 0 : nextIndex);
				};

				const movePrev = () => {
					const nextIndex = activeIndex - 1;
					setActiveIndex(nextIndex < 0 ? value.length - 1 : nextIndex);
				};

				const prevKey =
					orientation === 'horizontal'
						? direction === 'ltr'
							? 'ArrowLeft'
							: 'ArrowRight'
						: 'ArrowUp';

				const nextKey =
					orientation === 'horizontal'
						? direction === 'ltr'
							? 'ArrowRight'
							: 'ArrowLeft'
						: 'ArrowDown';

				if (e.key === nextKey) {
					moveNext();
				} else if (e.key === prevKey) {
					movePrev();
				} else if (e.key === 'Enter' || e.key === 'Space') {
					if (activeIndex === -1) {
						dropzoneState.inputRef.current?.click();
					}
				} else if (e.key === 'Delete' || e.key === 'Backspace') {
					if (activeIndex !== -1) {
						removeFileFromSet(activeIndex);
						if (value.length - 1 === 0) {
							setActiveIndex(-1);
							return;
						}
						movePrev();
					}
				} else if (e.key === 'Escape') {
					setActiveIndex(-1);
				}
			},
			[
				value,
				activeIndex,
				removeFileFromSet,
				direction,
				dropzoneState.inputRef,
				orientation,
			]
		);

		useEffect(() => {
			if (!value) return;
			if (value.length === maxFiles) {
				setIsLOF(true);
				return;
			}
			setIsLOF(false);
		}, [value, maxFiles]);

		return (
			<FileUploaderContext.Provider
				value={{
					dropzoneState,
					isLOF,
					isFileTooBig,
					removeFileFromSet,
					activeIndex,
					setActiveIndex,
					orientation,
					direction,
					value,
				}}
			>
				<div
					ref={ref}
					tabIndex={0}
					onKeyDownCapture={handleKeyDown}
					className={cn(
						'grid w-full focus:outline-none overflow-hidden ',
						className,
						{
							'gap-2': value && value.length > 0,
						}
					)}
					dir={dir}
					{...props}
				>
					{children}
				</div>
			</FileUploaderContext.Provider>
		);
	}
);

FileUploader.displayName = 'FileUploader';

export const FileUploaderContent = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
	const { orientation, value } = useFileUpload();
	const containerRef = useRef<HTMLDivElement>(null);

	return (
		<div
			className={cn('w-full px-1')}
			ref={containerRef}
			aria-label="content file holder"
		>
			<div
				{...props}
				ref={ref}
				className={cn(
					'flex rounded-xl gap-1',
					orientation === 'horizontal' ? 'flex-raw flex-wrap' : 'flex-col',
					className
				)}
			>
				{value &&
					value.map((file: File, index: number) => (
						<FileUploaderItem key={file.name} index={index} file={file}>
							{file.name}
						</FileUploaderItem>
					))}
			</div>
		</div>
	);
});

FileUploaderContent.displayName = 'FileUploaderContent';

export const FileUploaderItem = forwardRef<
	HTMLDivElement,
	{ index: number; file: File } & React.HTMLAttributes<HTMLDivElement>
>(({ className, index, file, children, ...props }, ref) => {
	const { removeFileFromSet, activeIndex, direction } = useFileUpload();
	const isSelected = index === activeIndex;
	return (
		<div
			ref={ref}
			className={cn(
				buttonVariants({ variant: 'ghost' }),
				'h-12 p-1 justify-between cursor-pointer relative',
				className,
				isSelected ? 'bg-muted' : ''
			)}
			{...props}
		>
			<div className="font-medium leading-none tracking-tight flex items-center gap-1.5 h-full w-full">
				<FilePreview file={file} />
				{children}
			</div>
			<button
				type="button"
				className={cn(
					'absolute',
					direction === 'rtl' ? 'top-1 left-1' : 'top-1 right-1'
				)}
				onClick={() => removeFileFromSet(index)}
			>
				<span className="sr-only">remove item {index}</span>
				<RemoveIcon className="w-4 h-4 hover:stroke-destructive duration-200 ease-in-out" />
			</button>
		</div>
	);
});

FileUploaderItem.displayName = 'FileUploaderItem';

export const FileInput = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
	const { dropzoneState, isFileTooBig, isLOF } = useFileUpload();
	const rootProps = dropzoneState.getRootProps(); // Remove the isLOF condition
	return (
		<div
			ref={ref}
			{...props}
			className={`relative w-full ${isLOF ? 'opacity-50' : ''} cursor-pointer`} // Remove cursor-not-allowed
		>
			<div
				className={cn(
					`w-full rounded-lg duration-300 ease-in-out
          ${
						dropzoneState.isDragAccept
							? 'border-green-500'
							: dropzoneState.isDragReject || isFileTooBig
							? 'border-red-500'
							: 'border-gray-300'
					}`,
					className
				)}
				{...rootProps}
			>
				{children}
			</div>
			<Input
				ref={dropzoneState.inputRef}
				{...dropzoneState.getInputProps()}
				className="cursor-pointer" // Remove conditional class
			/>
		</div>
	);
});

FileInput.displayName = 'FileInput';
