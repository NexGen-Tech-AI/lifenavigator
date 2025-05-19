import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h2 className="text-6xl font-extrabold text-blue-600 dark:text-blue-400">404</h2>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">Page not found</h1>
        <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400">Sorry, we couldn't find the page you're looking for.</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Go back home
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-gray-900 dark:text-white">
            Go to dashboard <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}