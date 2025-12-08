import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const CallToAction = () => {
  const benefits = [
    "Increase student engagement",
    "Improve academic performance",
    "Reduce administrative burden",
    "Real-time parent communication",
    "Data-driven decision making",
    "Comprehensive reporting"
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
      </div>

      <div className="container px-4 mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Benefits */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your School Management?
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Join hundreds of schools across Africa using SmartGrade to deliver exceptional academic tracking and insights.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-200">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold text-lg px-8 py-6 shadow-lg hover:shadow-yellow-400/30 transition-all group"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto text-lg px-8 py-6 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 backdrop-blur-sm"
              >
                <Mail className="mr-2 w-5 h-5" />
                Contact Sales
              </Button>
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="grid grid-cols-1 gap-6">
            <StatCard
              number="500+"
              label="Schools Worldwide"
              description="Growing network of educational institutions"
            />
            <StatCard
              number="50K+"
              label="Active Students"
              description="Managed through SmartGrade daily"
            />
            <StatCard
              number="99.9%"
              label="Uptime Guarantee"
              description="Enterprise-grade reliability"
            />
            <StatCard
              number="24/7"
              label="Customer Support"
              description="Dedicated support team ready to help"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ number, label, description }: { number: string; label: string; description: string }) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
      <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">{number}</div>
      <h3 className="text-lg font-semibold text-white mb-1">{label}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
};

export default CallToAction;
