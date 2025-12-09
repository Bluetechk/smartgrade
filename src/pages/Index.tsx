import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LandingNavbar from "@/components/LandingNavbar";
import LandingHero from "@/components/LandingHero";
import LandingFeatures from "@/components/LandingFeatures";
import LandingTestimonials from "@/components/LandingTestimonials";
import LandingFooter from "@/components/LandingFooter";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingTestimonials />
      <LandingFooter />
    </div>
  );
};

export default Index;
