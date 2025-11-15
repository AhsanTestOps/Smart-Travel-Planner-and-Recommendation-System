import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FreeTripPlanForm = ({ onTripSaved }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    budget: '',
    currency: 'USD',
    adults: 1,
    children: 0,
    accommodation_type: '',
    transportation_mode: '',
    interests: '',
    description: '',
    contact_name: '',
    contact_email: '',
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Generate or get session ID
      let sessionId = localStorage.getItem('freeTripSessionId');
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('freeTripSessionId', sessionId);
      }

      const submitData = {
        ...formData,
        session_id: sessionId,
        interests: formData.interests.split(',').map(i => i.trim()).filter(i => i)
      };

      console.log('Submitting free trip data:', submitData);

      const response = await fetch('http://127.0.0.1:8000/api/free-trips/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      console.log('Free trip response:', data);

      if (data.success) {
        console.log('Free trip saved successfully:', data.trip);
        
        // Call the callback with the saved trip
        if (onTripSaved) {
          onTripSaved(data.trip);
        }
        
        // Navigate to map view with the trip data
        navigate('/map', { 
          state: { 
            freeTrip: data.trip,
            sessionId: sessionId
          } 
        });
      } else {
        setError(data.error || 'Failed to save trip. Please try again.');
      }
    } catch (err) {
      console.error('Error in FreeTripPlanForm handleSubmit:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🌍 Plan Your Free Trip
            </h1>
            <p className="text-gray-600">
              No signup required! Plan your perfect trip and see it on the map instantly.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination *
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="e.g., Paris, France"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget
                </label>
                <div className="flex">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="px-3 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="PKR">PKR</option>
                  </select>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="1000"
                    className="flex-1 px-4 py-3 border-t border-r border-b border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Travelers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adults
                </label>
                <input
                  type="number"
                  name="adults"
                  value={formData.adults}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Children
                </label>
                <input
                  type="number"
                  name="children"
                  value={formData.children}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accommodation Type
                </label>
                <select
                  name="accommodation_type"
                  value={formData.accommodation_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select accommodation</option>
                  <option value="hotel">Hotel</option>
                  <option value="hostel">Hostel</option>
                  <option value="airbnb">Airbnb</option>
                  <option value="resort">Resort</option>
                  <option value="guesthouse">Guesthouse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transportation
                </label>
                <select
                  name="transportation_mode"
                  value={formData.transportation_mode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select transportation</option>
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                  <option value="bus">Bus</option>
                  <option value="car_rental">Car Rental</option>
                  <option value="public_transport">Public Transport</option>
                </select>
              </div>
            </div>

            {/* Interests and Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests (comma-separated)
              </label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleInputChange}
                placeholder="e.g., museums, food, nightlife, nature, adventure"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us more about your ideal trip..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Optional Contact Info */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Contact Info (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Planning Your Trip...
                  </div>
                ) : (
                  '🗺️ Plan My Trip & Show on Map'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FreeTripPlanForm;
