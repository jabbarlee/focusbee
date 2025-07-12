export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-bee-soft flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
        <p className="text-amber-800">Loading your hive dashboard...</p>
      </div>
    </div>
  );
}
