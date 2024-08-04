'use client';
import { useState, useRef, useEffect } from 'react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import {
	MoonIcon,
	SunIcon,
	HamburgerMenuIcon,
	Cross1Icon,
	GitHubLogoIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';

export default function Header() {
	const { theme, setTheme } = useTheme();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [menuHeight, setMenuHeight] = useState(0);
	const menuRef = useRef<HTMLDivElement>(null);

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	useEffect(() => {
		if (menuRef.current) {
			setMenuHeight(isMenuOpen ? menuRef.current.scrollHeight : 0);
		}
	}, [isMenuOpen]);

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 max-w-screen-2xl items-center">
				{/* Left: Site Name */}
				<div className="flex flex-1 items-center justify-start">
					<Link href="/" className="flex items-center space-x-2">
						<span className="font-bold text-xl">PantryTracker.ai</span>
					</Link>
				</div>

				{/* Middle: Navigation Links (hidden on mobile) */}
				<nav className="hidden md:flex flex-1 items-center justify-center space-x-4">
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

				<div className="flex flex-1 items-center justify-end space-x-2">
					<Button variant="ghost" size="icon" aria-label="GitHub" asChild>
						<Link
							href="https://github.com/knhn1004/pantry-tracker"
							target="_blank"
							rel="noopener noreferrer"
						>
							<GitHubLogoIcon className="h-5 w-5" />
						</Link>
					</Button>
					<SignedOut>
						<SignInButton mode="modal">
							<Button variant="ghost" className="hidden md:inline-flex">
								Sign In
							</Button>
						</SignInButton>
					</SignedOut>
					<SignedIn>
						<UserButton />
					</SignedIn>
					<Button
						variant="ghost"
						size="icon"
						aria-label="Toggle theme"
						onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
					>
						<SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
						<MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						<span className="sr-only">Toggle theme</span>
					</Button>

					{/* Hamburger Menu (visible on mobile) */}
					<Button
						variant="ghost"
						size="icon"
						aria-label="Toggle menu"
						className="md:hidden"
						onClick={toggleMenu}
					>
						{isMenuOpen ? (
							<Cross1Icon className="h-5 w-5" />
						) : (
							<HamburgerMenuIcon className="h-5 w-5" />
						)}
					</Button>
				</div>
			</div>

			{/* Mobile Menu with transition */}
			<div
				ref={menuRef}
				style={{ height: `${menuHeight}px` }}
				className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
			>
				<nav className="flex flex-col items-center space-y-4 py-4">
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
					<SignedOut>
						<SignInButton mode="modal">
							<Button variant="ghost">Sign In</Button>
						</SignInButton>
					</SignedOut>
				</nav>
			</div>
		</header>
	);
}
