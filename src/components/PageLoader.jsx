export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </div>
        <p className="mt-4 text-gray-500 text-sm">Memuat halaman...</p>
      </div>
    </div>
  );
}
