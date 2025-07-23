import React, { useState, useEffect } from 'react';
import { SkeletonHero } from './ui/SkeletonLoader';

interface HomeProps {
  onGetStarted: () => void;
}

const Home: React.FC<HomeProps> = ({ onGetStarted }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuote, setCurrentQuote] = useState(0);

  // Coffee-inspired quotes
  const quotes = [
    "The perfect cup begins with the perfect recipe.",
    "Every bean tells a story, every brew is a journey.",
    "Precision in brewing, perfection in taste.",
    "From bean to cup, craft your masterpiece.",
    "Your brewing companion for the perfect extraction."
  ];

  // Simulate loading for hero content
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Rotate quotes every 4 seconds
  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        setCurrentQuote((prev) => (prev + 1) % quotes.length);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isLoading, quotes.length]);

  if (isLoading) {
    return <SkeletonHero />;
  }

  return (
    <div className="min-h-screen bg-mono-white">
      {/* Hero Section */}
      <section className="hero-mono relative">
        <div className="container-mono">
          <div className="text-center relative z-10">
            {/* Hero Image Placeholder */}
            <div className="aspect-hero bg-gradient-to-br from-mono-100 to-stone-100 rounded-2xl mb-8 relative overflow-hidden border border-mono-200">
              {/* Coffee-themed pattern overlay */}
              <div className="absolute inset-0 opacity-5">
                <svg 
                  className="w-full h-full" 
                  viewBox="0 0 100 100" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="coffee-beans" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="5" cy="5" r="2" fill="currentColor" />
                      <circle cx="15" cy="15" r="2" fill="currentColor" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#coffee-beans)" />
                </svg>
              </div>
              
              {/* Central coffee icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-mono-800 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-mono-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M3 7.5C3 6.67157 3.67157 6 4.5 6H17.5C18.3284 6 19 6.67157 19 7.5V12C19 15.3137 16.3137 18 13 18H10C6.68629 18 4 15.3137 4 12V7.5Z M7 3V6 M11 3V6 M15 3V6"
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M19 10H21C21.5523 10 22 10.4477 22 11V12C22 13.1046 21.1046 14 20 14H19"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Hero Text */}
            <h1 className="text-hero text-mono-900 mb-6 animate-fade-in text-balance">
              Master Your Perfect Brew
            </h1>
            
            <p className="text-body-lg text-mono-600 mb-8 max-w-2xl mx-auto animate-fade-in text-balance">
              Track, refine, and savour every cup. Your comprehensive companion for brewing the perfect coffee, every single time.
            </p>

            {/* Get Started Button */}
            <button
              onClick={onGetStarted}
              className="btn-mono-primary text-body-lg px-8 py-4 animate-fade-in hover:animate-hover-depress focus-mono"
              aria-label="Start tracking your coffee brewing recipes"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-mono-200 rounded-full opacity-30"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-mono-100 rounded-full opacity-50"></div>
        <div className="absolute top-1/2 left-20 w-2 h-2 bg-mono-400 rounded-full opacity-60"></div>
        <div className="absolute top-1/3 right-32 w-3 h-3 bg-mono-300 rounded-full opacity-40"></div>
      </section>

      {/* Quote Section */}
      <section className="section-spacing bg-stone-50">
        <div className="container-mono">
          <div className="text-center">
            <div className="max-w-4xl mx-auto">
              <blockquote className="text-h3 text-mono-700 font-medium italic relative">
                <span className="absolute -top-4 -left-4 text-6xl text-mono-300 leading-none">"</span>
                <span className="relative z-10 animate-fade-in" key={currentQuote}>
                  {quotes[currentQuote]}
                </span>
              </blockquote>
            </div>
            
            {/* Quote indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {quotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuote(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentQuote 
                      ? 'bg-mono-800 scale-125' 
                      : 'bg-mono-300 hover:bg-mono-500'
                  }`}
                  aria-label={`Show quote ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="section-spacing bg-mono-white">
        <div className="container-mono">
          <div className="text-center mb-16">
            <h2 className="text-h1 text-mono-900 mb-4">
              Everything You Need for Perfect Coffee
            </h2>
            <p className="text-body-lg text-mono-600 max-w-2xl mx-auto">
              From detailed brewing logs to advanced analytics, our platform provides all the tools you need to elevate your coffee game.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid-mono-cards">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
                title: "Detailed Brewing Logs",
                description: "Record every aspect of your brewing process with precision and ease."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "Advanced Analytics",
                description: "Discover patterns and insights to consistently brew better coffee."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: "Favorite Recipes",
                description: "Save and organize your best brews for easy access and sharing."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                ),
                title: "Easy Sharing",
                description: "Share your favorite recipes with fellow coffee enthusiasts."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="card-mono-hover p-8 text-center group"
              >
                <div className="w-12 h-12 bg-mono-900 text-mono-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-h3 text-mono-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-body text-mono-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;