import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const CallToAction = () => {
  const benefits = [
    "30-day free trial with full access",
    "No credit card required",
    "Cancel anytime"
  ];

  return (
    <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to transform your hiring?</span>
              <span className="block text-blue-200 mt-1">Start your free trial today.</span>
            </h2>
            <p className="mt-4 text-lg text-blue-100 max-w-lg">
              Join thousands of companies already using JobFit to find the perfect candidates and streamline their hiring process.
            </p>
            
            <div className="mt-6 space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-300 mr-2" />
                  <span className="text-blue-100">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-md text-white border border-blue-300 hover:bg-blue-700/30 transition-all duration-300 mt-4 sm:mt-0">
                Book a Demo
              </button>
            </div>
          </div>
          
          <div className="mt-10 lg:mt-0 relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20">
              <div className="bg-white rounded-xl p-6 shadow-inner">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded-md ml-2"></div>
                </div>
                
                {/* Mock dashboard UI */}
                <div className="space-y-4">
                  <div className="h-8 bg-blue-100 rounded-md w-full"></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 bg-green-100 rounded-md"></div>
                    <div className="h-20 bg-yellow-100 rounded-md"></div>
                    <div className="h-20 bg-purple-100 rounded-md"></div>
                  </div>
                  <div className="h-32 bg-gray-100 rounded-md"></div>
                  <div className="h-8 bg-blue-100 rounded-md w-1/2"></div>
                </div>
                
                <div className="mt-6 p-3 bg-blue-600 text-white text-sm rounded-lg text-center">
                  Start your free trial today
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-300 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-400 rounded-full opacity-50 blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;