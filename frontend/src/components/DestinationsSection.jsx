import React from 'react';
import { MapPin, Building, Camera, Utensils, ArrowRight } from 'lucide-react';

const DestinationsSection = () => {
  const categories = [
    {
      name: 'Attractions',
      icon: Camera,
      description: 'Museums, landmarks, and sightseeing spots',
      color: 'from-blue-500 to-blue-600',
      count: '50+',
      link: '/destinations#attractions'
    },
    {
      name: 'Hotels',
      icon: Building,
      description: 'Comfortable stays from budget to luxury',
      color: 'from-green-500 to-green-600',
      count: '30+',
      link: '/destinations#hotels'
    },
    {
      name: 'Restaurants',
      icon: Utensils,
      description: 'Local cuisine and fine dining experiences',
      color: 'from-orange-500 to-orange-600',
      count: '100+',
      link: '/destinations#restaurants'
    },
    {
      name: 'Explore All',
      icon: MapPin,
      description: 'Browse all destinations by location',
      color: 'from-purple-500 to-purple-600',
      count: 'All',
      link: '/destinations#attractions'
    }
  ];

  const featuredCities = [
    {
      name: 'Tokyo',
      country: 'Japan',
      image: 'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHRva3lvfGVufDB8fDB8fHww',
      attractions: 15,
      description: 'Modern metropolis meets ancient tradition',
      link: '/destinations#attractions'
    },
    {
      name: 'Paris',
      country: 'France', 
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGFyaXN8ZW58MHx8MHx8fDA%3D',
      attractions: 12,
      description: 'City of lights and romance',
      link: '/destinations#paris'
    },
    {
      name: 'New York',
      country: 'USA',
      image: 'https://images.unsplash.com/photo-1553608622-8c715b1b5145?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bmV3eW9ya3xlbnwwfHwwfHx8MA%3D%3D',
      attractions: 18,
      description: 'The city that never sleeps',
      link: '/destinations#new-york'
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
              <MapPin className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Amazing Destinations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the world's most incredible places, from iconic landmarks to hidden gems. 
            Find the perfect attractions, hotels, and restaurants for your next adventure.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                onClick={() => window.location.href = category.link}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">{category.count}</span>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Featured Cities */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Popular Destinations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCities.map((city, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              >
                {/* City Image Placeholder */}
            {/*}    <div className={`h-48 bg-gradient-to-r ${city.image} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
                  <div className="text-center text-white z-10">
                    <h4 className="text-2xl font-bold mb-2">{city.name}</h4>
                    <p className="text-sm opacity-90">{city.country}</p>
                  </div>
                </div>
            */}
            {/* City Image */}
<div className="relative h-48 overflow-hidden">
  <img 
    src={city.image} 
    alt={`Image of ${city.name}`} 
    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
  />
  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all"></div>
  <div className="absolute inset-0 flex items-center justify-center text-center text-white z-10">
    <div>
      <h4 className="text-2xl font-bold mb-2">{city.name}</h4>
      <p className="text-sm opacity-90">{city.country}</p>
    </div>
  </div>
</div>
                {/* City Info */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{city.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Camera className="h-4 w-4" />
                      <span>{city.attractions} Attractions</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm group-hover:underline"
                    onClick={(e) => {
    e.stopPropagation();
    window.location.href = city.link;
  }}>
                     
                      Explore City

                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-12 text-white shadow-2xl">
          <h3 className="text-3xl font-bold mb-4">Ready to Explore?</h3>
          <p className="text-xl mb-8 opacity-90">
            Browse thousands of destinations, read reviews, and plan your perfect trip
          </p>
          
          <button 
  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
  onClick={() => window.location.href = '/destinations'}
>
  Browse All Destinations
  <ArrowRight className="ml-2 h-5 w-5" />
</button>
        </div>
      </div>
    </div>
  );
};

export default DestinationsSection;