import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
});
import './globals.css';
import Header from '@/components/header';

export const metadata: Metadata = {
	title: 'Pantry Tracker',
	description:
		'AI Pantry Tracker that generates recipes based on ingredients and load from images/receipts',
};
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body
					className={cn(
						'min-h-screen bg-background font-sans antialiased',
						fontSans.variable
					)}
				>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
						<Header />
						<main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
							{children}
						</main>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
