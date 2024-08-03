'use client';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

export default function Header() {
	const { theme, setTheme } = useTheme();
	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 max-w-screen-2xl items-center">
				{/* Left: Site Name */}
				<div className="flex flex-1 items-center justify-start">
					<Link href="/" className="flex items-center space-x-2">
						<span className="font-bold text-xl">Pantry Tracker</span>
					</Link>
				</div>

				{/* Middle: Navigation Links */}
				<nav className="flex flex-1 items-center justify-center space-x-4">
					<Link
						href="/"
						className="text-sm font-medium transition-colors hover:text-primary"
					>
						Home
					</Link>
					<Link
						href="/inventory"
						className="text-sm font-medium transition-colors hover:text-primary"
					>
						Inventory
					</Link>
					<Link
						href="/recipes"
						className="text-sm font-medium transition-colors hover:text-primary"
					>
						Recipes
					</Link>
					<Link
						href="/shopping-list"
						className="text-sm font-medium transition-colors hover:text-primary"
					>
						Shopping List
					</Link>
				</nav>

				{/* Right: Auth and Theme Toggle (placeholder for now) */}
				<div className="flex flex-1 items-center justify-end">
					{/* Placeholder for Clerk Auth buttons */}

					<SignedOut>
						<SignInButton />
					</SignedOut>
					<SignedIn>
						<UserButton />
					</SignedIn>
					<Button
						variant="ghost"
						size="icon"
						aria-label="Toggle theme"
						className="mr-6"
						onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
					>
						<SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
						<MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						<span className="sr-only">Toggle theme</span>
					</Button>
				</div>
			</div>
		</header>
	);
}
