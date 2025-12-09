import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import studentsImage from "@/asset/students.webp";

const LandingHero = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img 
          src={studentsImage}
          alt="Students in classroom" 
          className="w-full h-full object-cover"
        />
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content container */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-end">
          {/* Login & Register Form - White card overlay */}
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              School Management System: Login & Register
            </h2>
            
            <div className="space-y-4">
              {/* Username/Email field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700">Username/Email</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Username/Email"
                  className="w-full"
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login button */}
              <Link to="/auth" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg">
                  Login
                </Button>
              </Link>

              {/* Forget password link */}
              <div className="text-center">
                <Link to="/auth" className="text-sm text-blue-600 hover:text-blue-700 underline">
                  Forget password?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;

