import React, { useState, useEffect } from 'react';
import { Clock, Users, Award, TrendingUp } from 'lucide-react';

const statsData = [
  {
    icon: <Clock className="h-7 w-7" />,
    value: 75,
    unit: '%',
    label: 'Less Screening Time',
    color: 'from-blue-400 to-blue-600'
  },
  {
    icon: <Users className="h-7 w-7" />,
    value: 40,
    unit: '%',
    label: 'Better Candidate Quality',
    color: 'from-indigo-400 to-indigo-600'
  },
  {
    icon: <Award className="h-7 w-7" />,
    value: 90,
    unit: '%',
    label: 'Client Satisfaction',
    color: 'from-green-400 to-green-600'
  },
  {
    icon: <TrendingUp className="h-7 w-7" />,
    value: 3,
    unit: 'x',
    label: 'Faster Time-to-Hire',
    color: 'from-purple-400 to-purple-600'
  },
];

const Stats = () => {
  const [counters, setCounters] = useState(statsData.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            animateCounters();
            setHasAnimated(true);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    const statsElement = document.getElementById('stats-section');
    if (statsElement) {
      observer.observe(statsElement);
    }

    return () => {
      if (statsElement) {
        observer.unobserve(statsElement);
      }
    };
  }, [hasAnimated]);

  const animateCounters = () => {
    const duration = 2000; // 2 seconds
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);

    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const updatedCounters = statsData.map((stat) => {
        return Math.floor(stat.value * (progress < 1 ? progress : 1));
      });
      setCounters(updatedCounters);

      if (frame === totalFrames) {
        clearInterval(timer);
      }
    }, frameDuration);
  };

  return (
    <section id="stats-section" className="py-20 bg-gray-900 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20px 20px, white 2%, transparent 0%)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 mb-6 text-sm font-medium rounded-full bg-blue-900 text-blue-200">
            Our Impact
          </span>
          <h2 className="text-3xl font-extrabold mb-6 text-white sm:text-4xl">
            Our Impact in Numbers
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            See how JobFit transforms recruitment processes for businesses worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="text-center bg-gray-800 rounded-xl p-8 backdrop-blur-sm border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 relative group overflow-hidden"
            >
              {/* Gradient background that appears on hover */}
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10"></div>
              
              <div className={`mb-5 inline-flex items-center justify-center h-16 w-16 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">{stat.icon}</div>
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2 flex items-center justify-center">
                <span>{counters[index]}</span>
                <span className="ml-1">{stat.unit}</span>
              </div>
              <p className="text-gray-300 group-hover:text-white transition-colors duration-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;