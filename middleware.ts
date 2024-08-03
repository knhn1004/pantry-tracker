import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/', '/sign-in', '/sign-up']);

export default clerkMiddleware((auth, req) => {
	// print the request URL
	console.log(req.url);
	if (!auth().userId && !isPublicRoute(req)) {
		// Add custom logic to run before redirecting
		return auth().redirectToSignIn();
	}

	if (!isPublicRoute(req)) auth().protect();
});

export const config = {
	matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
