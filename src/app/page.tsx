export default function Home() {
  return (
    <div className="min-h-screen bg-bee-gradient relative overflow-hidden">
      {/* Background honeycomb pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="grid grid-cols-8 gap-4 p-8 transform rotate-12 scale-150">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 border-2 border-amber-400/60 transform rotate-45"
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Header with FocusBee Branding */}
        <header className="text-center mb-20">
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-amber-900 mb-4">
              Focus<span className="text-amber-600">Bee</span>
            </h1>
          </div>

          <p className="text-xl text-amber-800 max-w-2xl mx-auto leading-relaxed">
            Your cozy companion for deep focus sessions
          </p>
        </header>

        {/* Main content area */}
        <main className="flex flex-col lg:flex-row items-center gap-20 max-w-6xl mx-auto">
          {/* QR Code Section */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-8 rounded-3xl shadow-2xl animate-pulse-glow mb-8">
              {/* QR Code placeholder */}
              <div className="w-64 h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-4 border-amber-200">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-300 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zM3 15h6v6H3v-6zm2 2v2h2v-2H5zM15 3h6v6h-6V3zm2 2v2h2V5h-2zM11 5h2v2h-2V5zM5 11h2v2H5v-2zM11 11h2v2h-2v-2zM17 11h2v2h-2v-2zM11 17h2v2h-2v-2zM17 17h2v2h-2v-2zM15 15h2v2h-2v-2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 font-mono">
                    QR Code Placeholder
                  </p>
                </div>
              </div>
            </div>

            <p className="text-lg text-amber-800 text-center max-w-sm leading-relaxed">
              <span className="font-semibold">Scan this code</span> with your
              phone to start your Focus Zone habit
            </p>
          </div>

          {/* Instructions */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-amber-900 mb-6">
                Ready to Focus?
              </h2>

              <div className="space-y-6 text-lg text-amber-800">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 text-amber-900 font-bold">
                    1
                  </div>
                  <p>Scan the QR code with your phone</p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 text-amber-900 font-bold">
                    2
                  </div>
                  <p>Follow the guided ritual</p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 text-amber-900 font-bold">
                    3
                  </div>
                  <p>Create distance from your phone</p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 text-amber-900 font-bold">
                    4
                  </div>
                  <p>Enter your focused work zone</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-20 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-amber-200">
            <p className="text-amber-700 mb-2">
              <span className="font-semibold">🔐 Privacy First</span> • No
              accounts required • No data stored
            </p>
            <p className="text-sm text-amber-600">
              Just you, your phone, and a friendly companion helping you focus
              better
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
