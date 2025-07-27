import { Clock } from "lucide-react";

export function SessionWaitingScreen() {
  return (
    <div className="min-h-screen bg-bee-soft flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
          <Clock size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-amber-900 mb-4">
          Session Activated! 🐝
        </h1>
        <p className="text-xl text-amber-800 mb-8 leading-relaxed">
          Launching your focus zone...
        </p>
      </div>
    </div>
  );
}
