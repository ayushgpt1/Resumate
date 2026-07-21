import React from 'react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Testimonials from '../components/landing/Testimonials';
import CallToAction from '../components/landing/CallToAction';
import Footer from '../components/landing/Footer';
import Stats from '../components/landing/Stats';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Features />
      <Testimonials />
      <Stats />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default LandingPage;