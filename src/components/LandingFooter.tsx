import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin } from "lucide-react";

// Custom Pinterest icon component
const Pinterest = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.599-.299-1.484c0-1.388.805-2.425 1.809-2.425.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.481 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.744 2.281a.3.3 0 0 1 .069.288l-.278 1.133c-.044.183-.145.223-.334.135-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.292-1.155l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
  </svg>
);

const LandingFooter = () => {
  return (
    <footer id="contact" className="bg-blue-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Site Map */}
          <div>
            <h4 className="text-lg font-bold mb-4">Site Map</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/80 hover:text-yellow-400 transition-colors">
                  Site Map
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-yellow-400 transition-colors">
                  Herrenttimiity
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-yellow-400 transition-colors">
                  Siite:map
                </Link>
              </li>
            </ul>
          </div>

          {/* Service */}
          <div>
            <h4 className="text-lg font-bold mb-4">Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="#contact" className="text-white/80 hover:text-yellow-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="#pricing" className="text-white/80 hover:text-yellow-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="#contact" className="text-white/80 hover:text-yellow-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="text-white/80">+19123-455-6780</li>
              <li className="text-white/80">info@iseelalwmBeb.com</li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-bold mb-4">Social Media</h4>
            <div className="flex gap-4">
              <a href="#" className="text-white/80 hover:text-yellow-400 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-white/80 hover:text-yellow-400 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-white/80 hover:text-yellow-400 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-white/80 hover:text-yellow-400 transition-colors">
                <Pinterest className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;

