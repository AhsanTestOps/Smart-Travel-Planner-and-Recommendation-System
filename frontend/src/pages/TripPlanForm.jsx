import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripContext } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, DollarSign, MapPin, AlertCircle } from 'lucide-react';

const TripPlanForm = () => {
  const navigate = useNavigate();
  const { updateCurrentTrip, saveTrip } = useTripContext();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    travelers: 1,
    interests: [],
    budget_per_person: 1000,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const interestOptions = [
    'Adventure',
    'Culture',
    'Shopping',
    'Relaxation',
    'Food & Drink',
    'Nightlife',
    'Nature',
    'History',
    'Art',
    'Sports'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('TripPlanForm handleSubmit called');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('formData:', formData);

    if (!isAuthenticated) {
      console.error('User not authenticated in TripPlanForm');
      setError('Please log in to save trips');
      setLoading(false);
      return;
    }

    try {
      console.log('Calling saveTrip with:', formData);
      
      // Prepare data for backend - ensure proper field names and types
      const tripDataForBackend = {
        destination: formData.destination,
        start_date: formData.start_date,
        end_date: formData.end_date,
        travelers: parseInt(formData.travelers),
        interests: formData.interests,
        budget_per_person: parseFloat(formData.budget_per_person),
        itinerary: {
          generated_at: new Date().toISOString(),
          preferences: {
            interests: formData.interests,
            budget: formData.budget_per_person
          }
        }
      };
      
      // Save trip to backend
      const savedTrip = await saveTrip(tripDataForBackend);
      console.log('Trip saved successfully:', savedTrip);
      
      // Prepare data for frontend map display with the saved trip data
      const tripDataForMap = {
        ...savedTrip,
        // Ensure backwards compatibility with different field name formats
        travelers: savedTrip.travelers || formData.travelers,
        interests: savedTrip.interests || formData.interests,
        budget_per_person: savedTrip.budget_per_person || formData.budget_per_person
      };
      
      updateCurrentTrip(tripDataForMap);
      navigate('/map');
    } catch (err) {
      console.error('Error in TripPlanForm handleSubmit:', err);
      setError(err.message || 'Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecommendations = (data) => {
    // This function is kept for backwards compatibility
    // The enhanced map component will generate attractions dynamically
    return [];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Plan Your Dream Trip</h1>
        <p className="text-lg text-gray-600">Tell us about your travel preferences and we'll create a personalized itinerary</p>
      </div>

      <div className="card p-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-2" />
              Where are you going?
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="Enter destination (e.g., Paris, Tokyo, New York)"
              className="input-field"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-2" />
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-2" />
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Number of Travelers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-2" />
              Number of Travelers
            </label>
            <select
              name="travelers"
              value={formData.travelers}
              onChange={handleInputChange}
              className="input-field"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'traveler' : 'travelers'}</option>
              ))}
            </select>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Interests
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.interests.includes(interest)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-2" />
              Budget per person ($)
            </label>
            <div className="space-y-4">
              <input
                type="range"
                name="budget_per_person"
                min="100"
                max="5000"
                step="100"
                value={formData.budget_per_person}
                onChange={handleInputChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>$100</span>
                <span className="font-medium text-primary-600">${formData.budget_per_person}</span>
                <span>$5000</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {loading ? 'Saving Trip...' : 'Generate Itinerary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripPlanForm;
