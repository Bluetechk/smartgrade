import { Star } from "lucide-react";

const LandingTestimonials = () => {
  const testimonials = [
    {
      type: "Parent Testimonial",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop",
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      name: "Parent Name"
    },
    {
      type: "Teacher Testimonial",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      name: "Teacher Name"
    },
    {
      type: "Principal Testimonial",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      name: "Principal Name"
    }
  ];

  return (
    <section className="py-16 bg-green-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="flex justify-center mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.type}
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">{testimonial.type}</h4>
              <p className="text-slate-600 mb-4 leading-relaxed italic">"{testimonial.quote}"</p>
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingTestimonials;

