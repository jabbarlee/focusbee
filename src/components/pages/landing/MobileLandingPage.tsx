import {
  Smartphone,
  Laptop,
  Shield,
  Zap,
  Target,
  Clock,
  Brain,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Flame,
  Timer,
  HelpCircle,
} from "lucide-react";

interface MobileLandingPageProps {}

export function MobileLandingPage({}: MobileLandingPageProps) {
  const focusModes = [
    {
      id: "quick-buzz",
      name: "Quick Buzz",
      duration: 20,
      description: "Rapid focus burst",
      icon: Zap,
      color: "from-yellow-400 to-orange-500",
      textColor: "text-yellow-600",
    },
    {
      id: "honey-flow",
      name: "Honey Flow",
      duration: 40,
      description: "Solid work block to build momentum and flow",
      icon: Flame,
      color: "from-orange-400 to-red-500",
      textColor: "text-orange-600",
    },
    {
      id: "deep-nectar",
      name: "Deep Nectar",
      duration: 90,
      description: "Long, immersive session for serious deep work",
      icon: Timer,
      color: "from-purple-400 to-indigo-500",
      textColor: "text-purple-600",
    },
  ];

  const benefits = [
    {
      icon: Brain,
      title: "Enhanced Focus",
      description:
        "Physical separation from your phone eliminates digital distractions and allows your brain to enter deep work mode.",
    },
    {
      icon: TrendingUp,
      title: "Increased Productivity",
      description:
        "Studies show that having your phone in another room can increase focus and task completion by up to 26%.",
    },
    {
      icon: Shield,
      title: "Reduced Anxiety",
      description:
        "Breaking the constant connectivity cycle helps reduce stress and anxiety associated with notification pressure.",
    },
    {
      icon: Target,
      title: "Better Work Quality",
      description:
        "Deep, uninterrupted work sessions lead to higher quality output and more creative problem-solving.",
    },
  ];

  const steps = [
    {
      step: 1,
      title: "Open FocusBee on Your Laptop",
      description:
        "Access focusbee.com from your work computer or laptop to get started.",
      icon: Laptop,
    },
    {
      step: 2,
      title: "Scan the QR Code",
      description:
        "Use your phone to scan the QR code displayed on your laptop screen.",
      icon: Smartphone,
    },
    {
      step: 3,
      title: "Follow the Focus Ritual",
      description:
        "Complete the guided steps on your phone to prepare for focused work.",
      icon: CheckCircle,
    },
    {
      step: 4,
      title: "Place Phone Away",
      description:
        "Put your phone in another room and return to your laptop for deep work.",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-bee-soft relative overflow-hidden">
      {/* Background honeycomb pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-6 gap-3 p-4 transform rotate-12 scale-125">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 border-2 border-amber-400/40 transform rotate-45"
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {/* True Hero Section - Main Value Proposition */}
        <section className="px-6 py-8 text-center">
          <div className="max-w-md mx-auto">
            {/* Logo - Smaller and Higher */}
            <div className="mb-8 pt-4">
              <h1 className="text-3xl font-bold text-amber-900 mb-2">
                Focus<span className="text-amber-600">Bee</span>
              </h1>
              <p className="text-base text-amber-700 font-medium">
                Your companion for deep focus sessions
              </p>
            </div>

            <div className="w-12 h-0.5 bg-amber-500 mx-auto rounded-full mb-3"></div>
            {/* Main Hero Message - Bigger Font */}
            <div className="mb-12">
              <h2 className="text-5xl font-bold text-amber-900 mb-6 leading-tight">
                Transform Your Work Habits Through
                <span className="text-amber-600"> Phone Separation</span>
              </h2>

              <p className="text-xl text-amber-800 leading-relaxed mb-8">
                Break free from digital distractions and build lasting focus
                habits with guided rituals and intentional phone separation.
              </p>

              {/* Key Benefits Pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-200 shadow-sm">
                  <span className="text-sm font-medium text-amber-800">
                    🧠 Enhanced Focus
                  </span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-200 shadow-sm">
                  <span className="text-sm font-medium text-amber-800">
                    📈 Higher Productivity
                  </span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-200 shadow-sm">
                  <span className="text-sm font-medium text-amber-800">
                    🛡️ Less Anxiety
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Visual - Enhanced Design */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-amber-200/50">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 mb-3">
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-2 mx-auto shadow-lg">
                      <Smartphone size={20} className="text-white" />
                    </div>
                    <p className="text-xs font-semibold text-amber-800">
                      Phone Away
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-10 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mb-1"></div>
                    <div className="w-7 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mb-1"></div>
                    <div className="w-5 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"></div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mb-2 mx-auto shadow-lg">
                      <Brain size={20} className="text-white" />
                    </div>
                    <p className="text-xs font-semibold text-amber-800">
                      Deep Focus
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-amber-700 font-medium">
                Physical separation creates mental clarity
              </p>
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent mx-6"></div>

        {/* Switch to Laptop Section */}
        <section className="px-6 py-12 bg-gradient-to-b from-white/30 to-white/60 backdrop-blur-sm">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Laptop size={32} className="text-white" />
              </div>

              <h3 className="text-4xl font-bold text-amber-900 mb-4">
                Switch to Your Laptop
              </h3>

              <p className="text-amber-800 leading-relaxed mb-6">
                FocusBee works best when accessed from your laptop or computer.
                This creates the perfect setup for phone-work separation.
              </p>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <p className="text-sm text-amber-800 font-medium">
                  <span className="text-amber-600">💡 Pro Tip:</span> Open
                  focusbee.com on your laptop or computer to get started with
                  your focus session.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent mx-6"></div>

        {/* Why Phone Separation Matters */}
        <section className="px-6 py-12 bg-gradient-to-b from-amber-50/50 to-white/70 backdrop-blur-sm">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle size={24} className="text-white" />
              </div>
              <h3 className="text-4xl font-bold text-amber-900 mb-2">
                Why Separate Your Phone?
              </h3>
              <p className="text-amber-700">
                The science behind phone-free focused work
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <benefit.icon size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent mx-6"></div>

        {/* Focus Modes */}
        <section className="px-6 py-12 bg-gradient-to-b from-white/40 to-amber-50/40 backdrop-blur-sm">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={24} className="text-white" />
              </div>
              <h3 className="text-4xl font-bold text-amber-900 mb-2">
                Choose Your Focus Mode
              </h3>
              <p className="text-amber-700">
                Different session lengths for different types of work
              </p>
            </div>

            <div className="space-y-4">
              {focusModes.map((mode) => (
                <div
                  key={mode.id}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${mode.color} rounded-full flex items-center justify-center`}
                    >
                      <mode.icon size={24} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900">{mode.name}</h4>
                      <p className="text-sm text-amber-600 font-medium">
                        {mode.duration} minutes
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {mode.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent mx-6"></div>

        {/* How It Works */}
        <section className="px-6 py-12 bg-gradient-to-b from-white/60 to-white/80 backdrop-blur-sm">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target size={24} className="text-white" />
              </div>
              <h3 className="text-4xl font-bold text-amber-900 mb-2">
                How FocusBee Works
              </h3>
              <p className="text-amber-700">Simple steps to deep focus</p>
            </div>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {step.step}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-100">
                      <div className="flex items-center gap-3 mb-2">
                        <step.icon size={20} className="text-amber-600" />
                        <h4 className="font-bold text-amber-900 text-sm">
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent mx-6"></div>

        {/* Call to Action */}
        <section className="px-6 py-16 bg-gradient-to-b from-amber-50/60 to-amber-100/40 backdrop-blur-sm">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl p-8 text-white shadow-2xl">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Laptop size={32} className="text-white" />
              </div>

              <h3 className="text-4xl font-bold mb-4">Ready to Focus?</h3>

              <p className="mb-6 text-amber-100 leading-relaxed">
                Open FocusBee on your laptop to start building better focus
                habits today.
              </p>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                <div className="flex items-center justify-center gap-2 text-sm font-medium">
                  <span>🌐</span>
                  <span>focusbee.com</span>
                </div>
                <p className="text-xs text-amber-100 mt-2">
                  Access from your laptop or computer
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-sm text-amber-700">
              Build focus. Create habits. Separate distractions.
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
