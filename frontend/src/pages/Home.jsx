import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Star, Users, DollarSign, ArrowRight, CheckCircle, Globe, Compass, Heart, Sparkles, Plane, Camera, Coffee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DestinationsSection from '../components/DestinationsSection';
import heroImage from '../assets/cinematic-style-mall.jpg'; // Adjust the filename and extension as needed


const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
//Cards Why Choose Wanderlust AI? ...edit
  const features = [
    {
      icon: <Globe className="h-10 w-10 text-blue-600" />,
      title: "AI-Powered Recommendations",
      description: "Get personalized travel suggestions based on your interests, budget, and preferences.",
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-purple-50"
    },
    {
      icon: <MapPin className="h-10 w-10 text-emerald-600" />,
      title: "Interactive Maps",
      description: "Explore destinations with detailed maps, markers, and location information.",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50"
    },
    {
      icon: <Calendar className="h-10 w-10 text-orange-600" />,
      title: "Smart Itineraries",
      description: "Create detailed day-by-day itineraries with time optimization and budget tracking.",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50"
    },
    {
      icon: <DollarSign className="h-10 w-10 text-green-600" />,
      title: "Budget Planning",
      description: "Track expenses and get cost estimates for accommodations, activities, and dining.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "New York, USA",
      rating: 5,
      comment: "Wanderlust AI made planning my European trip so easy! The recommendations were spot-on and saved me hours of research.",
      avatar: "SJ",
      bgColor: "from-pink-500 to-rose-600"
    },
    {
      name: "Mike Chen",
      location: "Toronto, Canada", 
      rating: 5,
      comment: "Love how it suggested hidden gems I never would have found on my own. The itinerary was perfect for my family!",
      avatar: "MC",
      bgColor: "from-blue-500 to-indigo-600"
    },
    {
      name: "Emma Rodriguez",
      location: "Madrid, Spain",
      rating: 5,
      comment: "The budget tracking feature saved me so much money. Highly recommend for solo travelers and families alike!",
      avatar: "ER",
      bgColor: "from-purple-500 to-pink-600"
    },
    {
      name: "David Kim",
      location: "Seoul, Korea",
      rating: 5,
      comment: "Amazing AI suggestions! Discovered incredible local restaurants and attractions I would have missed otherwise.",
      avatar: "DK",
      bgColor: "from-green-500 to-emerald-600"
    }
  ];

  const popularDestinations = [
    {
      name: "Paris, France",
      image: "🗼",
      description: "City of Light and Love",
      trips: "2,450+ trips planned",
      gradient: "from-pink-400 via-red-400 to-yellow-400",
      highlights: ["Eiffel Tower", "Louvre Museum", "Seine River"]
    },
    {
      name: "Tokyo, Japan", 
      image: "🏯",
      description: "Modern meets Traditional",
      trips: "1,890+ trips planned",
      gradient: "from-purple-400 via-pink-400 to-red-400",
      highlights: ["Shibuya Crossing", "Mount Fuji", "Cherry Blossoms"]
    },
    {
      name: "Bali, Indonesia",
      image: "🏝️",
      description: "Tropical Paradise",
      trips: "3,120+ trips planned",
      gradient: "from-green-400 via-blue-400 to-purple-400",
      highlights: ["Rice Terraces", "Beaches", "Temples"]
    },
    {
      name: "New York, USA",
      image: "🏙️", 
      description: "The City That Never Sleeps",
      trips: "1,670+ trips planned",
      gradient: "from-yellow-400 via-orange-400 to-red-400",
      highlights: ["Times Square", "Central Park", "Brooklyn Bridge"]
    },
    {
      name: "Santorini, Greece",
      image: "🌅",
      description: "Mediterranean Dream",
      trips: "2,340+ trips planned",
      gradient: "from-blue-400 via-cyan-400 to-teal-400",
      highlights: ["Blue Domes", "Sunset Views", "Wine Tasting"]
    },
    {
      name: "Dubai, UAE",
      image: "🕌",
      description: "Luxury & Adventure",
      trips: "1,580+ trips planned",
      gradient: "from-amber-400 via-yellow-400 to-orange-400",
      highlights: ["Burj Khalifa", "Desert Safari", "Shopping"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${heroImage})`
            }}
          >
            {/* Simple overlay for text readability */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        </div>

        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="text-lg font-semibold flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span>AI-Powered Travel Planning</span>
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                </span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Plan Your Dream Trip<br></br>
             with AI Magic ✨

              
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-indigo-100 leading-relaxed max-w-4xl mx-auto">
              Discover amazing destinations, create perfect itineraries, and make unforgettable memories with our 
              <span className="font-semibold text-bold-white-500"> intelligent travel planning platform</span> trusted by thousands of happy travelers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/plan')}
                  className="px-8 py-4 bg-white/90 text-gray-900 font-bold text-lg rounded-lg hover:bg-white transform hover:scale-105 transition-all duration-300 min-w-[200px]"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Start Planning</span>
                  </span>
                </button>
              ) : (
                <Link
                  to="/free-plan"
                  className="px-8 py-4 bg-white/90 text-gray-900 font-bold text-lg rounded-lg hover:bg-white transform hover:scale-105 transition-all duration-300 min-w-[200px]"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Get Started Free</span>
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </Link>
              )}

              <button
                onClick={() => navigate('/ai-travel')}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold text-lg rounded-lg border-2 border-white/30 hover:bg-white/30 transform hover:scale-105 transition-all duration-300 min-w-[200px]"
              >
                <span className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>AI Travel Planner</span>
                </span>
              </button>
              
              <button
                onClick={() => navigate('/map')}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold text-lg rounded-lg border-2 border-white/30 hover:bg-white/30 transform hover:scale-105 transition-all duration-300 min-w-[200px]"
              >
                <span className="flex items-center space-x-2">
                  <Compass className="h-5 w-5" />
                  <span>Explore Destinations</span>
                </span>
              </button>
            </div>

            {/* Stats section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">10K+</div>
                <div className="text-base text-white/90">Happy Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">150+</div>
                <div className="text-base text-white/90">Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">25K+</div>
                <div className="text-base text-white/90">Trips Planned</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">4.9<span className="text-yellow-400">★</span></div>
                <div className="text-base text-white/90">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#151E34]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Wanderlust AI?
            </h2>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Our intelligent platform combines cutting-edge AI with local expertise to create personalized travel experiences that exceed your expectations.
            </p>
          </div>
      {/* Mapping where edit the Why Choose Wanderlust AI? cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/10">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-white transition-all duration-300 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Travel Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                AI-Powered Travel Planning
              </h2>
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of travel planning with our advanced AI that creates personalized itineraries, estimates budgets, and recommends hidden gems.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Itineraries</h3>
                    <p className="text-gray-600">Our AI analyzes your preferences, travel style, and budget to create the perfect day-by-day itinerary tailored just for you.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Budget Estimation</h3>
                    <p className="text-gray-600">Get accurate cost breakdowns for accommodation, food, activities, and transportation with real-time pricing data.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Local Insights & Hidden Gems</h3>
                    <p className="text-gray-600">Discover authentic local experiences and off-the-beaten-path destinations that match your interests perfectly.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-950 to-blue-500 rounded-2xl p-12 text-white">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold mb-4">Ready to Experience AI Travel Planning?</h3>
                <p className="text-purple-100 mb-6">
                  Join thousands of travelers who have discovered their perfect trips with our AI-powered platform. Generate your first itinerary in under 2 minutes!
                </p>
                <button
                  onClick={() => navigate('/ai-travel')}
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold text-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>Try AI Travel Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Destinations
            </h2>
            <p className="text-xl text-gray-600">
              Discover the most loved destinations by our travelers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDestinations.map((destination, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                <div className="p-6 text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-200">
                    {destination.image}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{destination.name}</h3>
                  <p className="text-gray-600 mb-3">{destination.description}</p>
                  <p className="text-sm text-primary-600 font-medium">{destination.trips}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Database Section */}
      <DestinationsSection />

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Plan your perfect trip in just three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tell Us Your Preferences</h3>
              <p className="text-gray-600">Share your destination, dates, budget, and interests with our AI system.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get AI Recommendations</h3>
              <p className="text-gray-600">Receive personalized suggestions for places to visit, activities, and experiences.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Save & Share Your Trip</h3>
              <p className="text-gray-600">Save your itinerary, track your budget, and share with travel companions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Travelers Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of happy travelers who trust Wanderlust AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered their perfect trips with Wanderlust AI. Start planning your dream vacation today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/plan')}
                className="bg-white text-primary-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Calendar className="h-5 w-5" />
                <span>Plan Your Trip Now</span>
              </button>
            ) : (
              <>
                <Link
                  to="/free-plan"
                  className="bg-white text-primary-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>Start Free Today</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-700 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Benefits List */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-primary-100">
              <CheckCircle className="h-5 w-5" />
              <span>Free to get started</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-primary-100">
              <CheckCircle className="h-5 w-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-primary-100">
              <CheckCircle className="h-5 w-5" />
              <span>Instant recommendations</span>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
<footer className="bg-[#1e293b] text-gray-400 py-12">
  <div className="container mx-auto px-4 text-center">
    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      {/* Copyright */}
      <p className="text-sm">
        &copy; {new Date().getFullYear()} Smart Travel Planner and Recommendation System.
      </p>

      {/* Footer Links */}
      <div className="flex justify-center space-x-6">
      </div>
    </div>
  </div>
</footer>
    </div>
  );
};

export default Home;
