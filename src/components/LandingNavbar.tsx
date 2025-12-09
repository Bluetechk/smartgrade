import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LandingNavbar = () => {
  return (
    <>
      {/* Yellow top strip */}
      <div className="h-2 bg-yellow-400"></div>
      
      {/* Blue navigation bar */}
      <nav className="bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Navigation links */}
            <div className="flex items-center gap-8">
              <Link to="/" className="text-lg font-semibold hover:text-yellow-400 transition-colors">
                Home
              </Link>
              <Link to="#features" className="text-lg font-semibold hover:text-yellow-400 transition-colors">
                Features
              </Link>
              <Link to="#pricing" className="text-lg font-semibold hover:text-yellow-400 transition-colors">
                Pricing
              </Link>
              <Link to="#about" className="text-lg font-semibold hover:text-yellow-400 transition-colors">
                About Us
              </Link>
              <Link to="#contact" className="text-lg font-semibold hover:text-yellow-400 transition-colors">
                Contact
              </Link>
            </div>

            {/* Right side - Login and Register buttons */}
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold">
                  Login
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default LandingNavbar;

