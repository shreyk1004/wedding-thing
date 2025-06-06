export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold">Generating your beautiful wedding website...</h2>
        <p className="mt-2 text-gray-600">This may take a few moments</p>
      </div>
    </div>
  );
} 