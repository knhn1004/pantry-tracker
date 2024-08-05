import { create } from 'zustand';

interface ImageProcessingState {
	processing: boolean;
	setProcessing: (processing: boolean) => void;
}
export const useImageProcessingStore = create<ImageProcessingState>(set => ({
	processing: false,
	setProcessing: (processing: boolean) => set({ processing }),
}));
