export default function SubdomainNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Wedding Website Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          The wedding website you're looking for doesn't exist or hasn't been published yet.
        </p>
        <a 
          href="/"
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go to Main Site
        </a>
      </div>
    </div>
  );
} 