// This file is used to configure the app router for this specific route
// It tells Next.js how to handle static/dynamic rendering for this route

// Export dynamic = "force-dynamic" to make Next.js always render this page on the server
// This prevents build-time errors with client hooks like useSearchParams
export const dynamic = 'force-dynamic';