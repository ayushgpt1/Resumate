import React from 'react';
import { Brain, Shield, BarChart3, Users } from 'lucide-react';

const Features = () => {
  const features = [
    {
      name: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms analyze resumes to match candidates with the perfect roles.',
      icon: Brain,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      name: 'Analytics Dashboard',
      description: 'Comprehensive analytics and insights to optimize your hiring process.',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600'
    },
  ];

  return (
    <div className="py-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
            Features
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Powerful Features for Modern Recruitment
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Everything you need to streamline your hiring process and find the best talent.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 place-items-center justify-center">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6 group max-w-md">
                <div className="flow-root bg-white rounded-xl px-6 pb-8 shadow-md hover:shadow-xl transition-all duration-300 h-full border border-gray-100 hover:border-blue-200">
                  <div className="-mt-6">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center justify-center p-3 ${feature.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-semibold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors duration-300 text-center">
                      {feature.name}
                    </h3>
                    <p className="mt-5 text-base text-gray-500 group-hover:text-gray-600 transition-colors duration-300 text-center">
                      {feature.description}
                    </p>
                    <div className="mt-6 flex items-center justify-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Learn more</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;