import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Lock, Users, Award, PieChart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const Features = () => {
  const mainFeatures = [
    {
      number: "01",
      title: "Write & Grade",
      description: "Easily create and manage assignments with our intuitive grading interface. Support for multiple assessment types and weighted scoring.",
      icon: "✏️",
      color: "from-blue-50 to-cyan-50"
    },
    {
      number: "02",
      title: "Ask It Be My Page",
      description: "Interactive student pages where parents and students can track progress in real-time. Get instant notifications about grades and performance.",
      icon: "📋",
      color: "from-purple-50 to-pink-50"
    },
    {
      number: "03",
      title: "Schedule",
      description: "Organize your academic calendar with integrated scheduling. Manage grading periods, exams, and reporting deadlines effortlessly.",
      icon: "📅",
      color: "from-orange-50 to-yellow-50"
    }
  ];

  const features = [
    {
      icon: <Calculator className="w-12 h-12 text-blue-600" />,
      title: "Learning Standards",
      description: "Track student progress against established learning standards and educational frameworks"
    },
    {
      icon: <Award className="w-12 h-12 text-purple-600" />,
      title: "Advanced Analysis",
      description: "Deep insights into student performance with advanced analytics and trend prediction"
    },
    {
      icon: <Lock className="w-12 h-12 text-orange-600" />,
      title: "Financial Solution",
      description: "Integrated billing and financial tracking for school operations and student accounts"
    }
  ];

  return (
    <>
      {/* Main Features Section - Dark Background */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <div 
                key={index}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-yellow-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-yellow-400/30 transition-all h-full">
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-4xl font-bold text-white/20">{feature.number}</span>
                    <div className="text-4xl">{feature.icon}</div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-300 mb-6 leading-relaxed">{feature.description}</p>
                  <Button 
                    variant="outline" 
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 border-0 font-semibold"
                  >
                    Explore More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Icon Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>
                <Button 
                  variant="outline"
                  className="border-slate-300 text-slate-900 hover:bg-slate-100"
                >
                  Explore More
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Powerful Features for Modern Schools
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage academic performance and drive student success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureDetailCard
              icon={<Calculator className="w-10 h-10" />}
              title="Multi-Period Grading"
              description="Track student performance across six grading periods with weighted assessments"
              color="text-blue-600"
            />
            <FeatureDetailCard
              icon={<Lock className="w-10 h-10" />}
              title="Grade Locking System"
              description="Secure grade submission with administrative controls and audit trails"
              color="text-purple-600"
            />
            <FeatureDetailCard
              icon={<Award className="w-10 h-10" />}
              title="Automated Ranking"
              description="Real-time class rankings calculated automatically after each period"
              color="text-orange-600"
            />
            <FeatureDetailCard
              icon={<Users className="w-10 h-10" />}
              title="Student Portal"
              description="Dedicated access for students and parents to view grades and reports"
              color="text-green-600"
            />
            <FeatureDetailCard
              icon={<PieChart className="w-10 h-10" />}
              title="Analytics Dashboard"
              description="Comprehensive statistics including pass/fail rates and trend analysis"
              color="text-red-600"
            />
            <FeatureDetailCard
              icon={<Calendar className="w-10 h-10" />}
              title="Semester Averages"
              description="Automatic calculation of semester and yearly averages based on grades"
              color="text-indigo-600"
            />
          </div>
        </div>
      </section>
    </>
  );
};

const FeatureDetailCard = ({ 
  icon, 
  title, 
  description,
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: string;
}) => {
  return (
    <Card className="border-2 border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1 h-full">
      <CardContent className="pt-8">
        <div className={`${color} mb-4`}>{icon}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};

export default Features;
