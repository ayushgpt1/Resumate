import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      content: "JobFit has revolutionized our hiring process. We've reduced our time-to-hire by 60% while finding better-qualified candidates.",
      author: "Sarah Johnson",
      role: "HR Director",
      company: "Tech Solutions Inc.",
      rating: 5
    },
    {
      content: "The AI-powered screening has helped us eliminate unconscious bias and build a more diverse team. Our candidate satisfaction scores have increased dramatically.",
      author: "Michael Chen",
      role: "Talent Acquisition Manager",
      company: "Global Innovations",
      rating: 5
    },
    {
      content: "We've been able to identify top talent that our previous screening methods missed. JobFit's analytics have given us valuable insights into our hiring process.",
      author: "Emily Rodriguez",
      role: "CEO",
      company: "Startup Ventures",
      rating: 5
    }
  ];
  
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="py-24 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-100 opacity-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-indigo-100 opacity-50 rounded-full blur-3xl -ml-12 -mb-12"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
            Testimonials
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Trusted by Industry Leaders
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            See what our clients say about their experience with JobFit
          </p>
        </div>
        
        <div className="mt-20 relative">
          {/* Large testimonial */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-12 md:px-12 md:py-16">
              {/* Quote icon */}
              <div className="absolute top-8 left-8 text-blue-100">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24">
                  <path d="M50 30H20V60H50V30ZM50 60C50 76.5 36.5 90 20 90V80C31 80 40 71 40 60H50ZM100 30H70V60H100V30ZM100 60C100 76.5 86.5 90 70 90V80C81 80 90 71 90 60H100Z" fill="currentColor"/>
                </svg>
              </div>
              
              {/* Rating stars */}
              <div className="flex justify-center mb-8">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              
              <p className="text-2xl text-gray-700 leading-relaxed text-center italic relative z-10">
                "{testimonials[activeIndex].content}"
              </p>
              
              <div className="mt-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 text-xl font-bold">
                  {testimonials[activeIndex].author.split(' ').map(name => name[0]).join('')}
                </div>
                <p className="mt-4 text-lg font-semibold text-gray-900">{testimonials[activeIndex].author}</p>
                <p className="text-sm text-gray-500">{testimonials[activeIndex].role} at {testimonials[activeIndex].company}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-center mt-8 space-x-4">
            <button 
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-300 text-gray-600 hover:text-blue-600"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            {testimonials.map((_, index) => (
              <button 
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  activeIndex === index ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
            <button 
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-300 text-gray-600 hover:text-blue-600"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;