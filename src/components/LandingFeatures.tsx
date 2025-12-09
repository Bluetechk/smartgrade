import { Button } from "@/components/ui/button";
import { GraduationCap, Monitor, Settings, Camera, BookOpen, Shield } from "lucide-react";

const LandingFeatures = () => {
  // Main portals section (blue background)
  const portals = [
    {
      icon: <GraduationCap className="w-16 h-16 text-white" />,
      title: "Student Portal",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      icon: <Monitor className="w-16 h-16 text-white" />,
      title: "Teacher Dashboard",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      icon: <Settings className="w-16 h-16 text-white" />,
      title: "Admin Panel",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    }
  ];

  // Additional features section (white background)
  const features = [
    {
      icon: <Camera className="w-16 h-16 text-blue-600" />,
      title: "Attendance Tracking",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      icon: <BookOpen className="w-16 h-16 text-blue-600" />,
      title: "Gradebook & Reports",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      icon: <Shield className="w-16 h-16 text-blue-600" />,
      title: "Timetable Management",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    }
  ];

  return (
    <>
      {/* Main Features Section - Blue Background */}
      <section id="features" className="py-16 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portals.map((portal, index) => (
              <div key={index} className="text-center text-white">
                <div className="flex justify-center mb-6">
                  {portal.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{portal.title}</h3>
                <p className="text-white/90 mb-6 leading-relaxed">{portal.description}</p>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold">
                  Learn More
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section - White Background */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold">
                  Learn More
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingFeatures;

