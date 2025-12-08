import { Button } from "@/components/ui/button";
import { GraduationCap, TrendingUp, FileText, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navbar overlay */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none"></div>

      <div className="container relative z-10 px-4 py-20 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/30">
                <GraduationCap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">SmartGrade™</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
                Welcome to <br />
                <span className="text-yellow-400">SmartGrade</span>
              </h1>

              <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
                Transform your school's academic management with our comprehensive platform. Real-time insights, automated rankings, and detailed reporting designed for African educational institutions.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold text-lg px-8 py-6 shadow-lg hover:shadow-yellow-400/30 transition-all">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 backdrop-blur-sm">
                Learn More
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <FeatureHighlight 
                icon={<TrendingUp className="w-5 h-5" />}
                text="Real-Time Rankings"
              />
              <FeatureHighlight 
                icon={<FileText className="w-5 h-5" />}
                text="Detailed Reports"
              />
              <FeatureHighlight 
                icon={<BarChart3 className="w-5 h-5" />}
                text="Smart Analytics"
              />
              <FeatureHighlight 
                icon={<GraduationCap className="w-5 h-5" />}
                text="Student Portal"
              />
            </div>
          </div>

          {/* Right side - Hero image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl overflow-hidden shadow-2xl">
              {/* Placeholder for hero image */}
              <img 
                src="asset/students.webp" 
                alt="Students learning" 
                className="w-full h-full object-cover"
              />
              {/* Overlay card */}
              <div className="absolute bottom-6 right-6 left-6 bg-white rounded-xl shadow-xl p-6 backdrop-blur-sm bg-white/95">
                <h3 className="font-bold text-slate-900 mb-2 text-sm">Aktos Lammantigas</h3>
                <p className="text-slate-600 text-xs mb-4">LR Pageas</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">StudentID</span>
                    <span className="text-slate-900 font-semibold">547030</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Email</span>
                    <span className="text-slate-900 font-semibold">student@example.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Department</span>
                    <span className="text-slate-900 font-semibold">Science</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureHighlight = ({ icon, text }: { icon: React.ReactNode; text: string }) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="text-yellow-400">{icon}</div>
      <span className="text-sm font-medium text-white">{text}</span>
    </div>
  );
};

export default Hero;
