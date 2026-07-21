import React from 'react';
import { Brain, Users, LineChart } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
      {/* Background pattern for visual interest */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), 
                           radial-gradient(circle at 75px 75px, white 2%, transparent 0%)`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <span className="inline-block px-3 py-1 mb-6 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
              AI-Powered Recruitment
            </span>
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Transform Your</span>
              <span className="block text-blue-200">Hiring Process</span>
            </h1>
            <p className="mt-6 text-base text-blue-100 sm:mt-7 sm:text-xl lg:text-lg xl:text-xl max-w-3xl">
              Leverage AI-powered recruitment to find the perfect candidates faster and smarter. Eliminate bias and make data-driven hiring decisions.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
              <button className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started Free
              </button>
              <button className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-md text-white border border-blue-300 hover:bg-blue-700/30 transition-all duration-300 mt-3 sm:mt-0">
                Watch Demo
              </button>
            </div>
            
            {/* Trustpilot-style trust indicators */}
            <div className="mt-12 text-center lg:text-left">
              <p className="text-blue-200 text-sm mb-2">Trusted by 500+ companies worldwide</p>
              <div className="flex justify-center lg:justify-start items-center space-x-6">
                <div className="w-16 h-7 bg-white/20 rounded"></div>
                <div className="w-20 h-7 bg-white/20 rounded"></div>
                <div className="w-18 h-7 bg-white/20 rounded"></div>
                <div className="w-14 h-7 bg-white/20 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-xl shadow-2xl lg:max-w-md overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/40 to-purple-500/40 backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img
                className="w-full rounded-xl transition-all duration-500 group-hover:scale-105"
                src="https://images.unsplash.com/photo-1551135049-8a33b5883817?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Team meeting"
              />
              {/* Float indicators that suggest AI analyzing candidates */}
              <div className="absolute top-4 right-4 bg-white/90 rounded-lg px-3 py-2 text-sm font-medium text-blue-700 shadow-lg z-20">
                <div className="flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  <span>AI Analysis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="currentColor"/>
        </svg>
      </div>
    </div>
  );
};

export default Hero;