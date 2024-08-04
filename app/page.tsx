import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
	return (
		<main className="container mx-auto px-4 py-8">
			<header className="text-center mb-12">
				<h1 className="text-4xl font-bold mb-4">PantryTracker.ai</h1>
				<p className="text-xl text-muted-foreground">
					Smart Pantry Management for Sustainable Living
				</p>
			</header>

			<section className="grid md:grid-cols-2 gap-8 mb-12">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">Smart Inventory Tracker</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="mb-4">
							Keep track of your pantry items effortlessly with our AI-powered
							inventory system.
						</p>
						<ul className="space-y-2">
							{[
								'Real-time updates',
								'Expiration date alerts',
								'Auto-categorization',
							].map((feature, index) => (
								<li key={index} className="flex items-center">
									<CheckCircle className="mr-2 h-4 w-4 text-green-500" />
									{feature}
								</li>
							))}
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">AI Recipe Generator</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="mb-4">
							Reduce food waste with personalized recipes using your near-expiry
							ingredients.
						</p>
						<ul className="space-y-2">
							{[
								'Customized to your pantry',
								'Nutritionally balanced',
								'Waste reduction focus',
							].map((feature, index) => (
								<li key={index} className="flex items-center">
									<CheckCircle className="mr-2 h-4 w-4 text-green-500" />
									{feature}
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</section>

			<section className="text-center mb-12">
				<h2 className="text-3xl font-semibold mb-4">
					Start Saving Food and Money Today
				</h2>
				<Link href="/inventory">
					<Button size="lg">Get Started</Button>
				</Link>
			</section>
		</main>
	);
}
