import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FreeTripPlanForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [budgetValue, setBudgetValue] = useState(1000);
  
  const [formData, setFormData] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    number_of_travelers: 1,
    budget: 1000,
    adults: 1,
    children: 0,
  });

  const interestOptions = [
    'Adventure', 'Culture', 'Shopping', 'Relaxation', 'Food & Drink',
    'Nightlife', 'Nature', 'History', 'Art', 'Sports'
  ];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    
    if (type === 'number') {
      parsedValue = parseInt(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));

    // Update adults count when number of travelers changes
    if (name === 'number_of_travelers') {
      setFormData(prev => ({
        ...prev,
        adults: Math.max(1, parsedValue - prev.children)
      }));
    }
  };

  const handleInterestToggle = (interest) => {
    setSelectedInterests(prev => {
      const newInterests = prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest];
      return newInterests;
    });
  };

  const handleBudgetChange = (e) => {
    const value = parseInt(e.target.value);
    setBudgetValue(value);
    setFormData(prev => ({
      ...prev,
      budget: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Form submitted!'); // Debug log

    // Validate required fields
    if (!formData.destination || !formData.start_date || !formData.end_date) {
      setError('Please fill in all required fields (destination, start date, end date)');
      setLoading(false);
      return;
    }

    // Validate dates with improved logic
    try {
      // Parse dates properly (HTML date inputs return YYYY-MM-DD format)
      const startDateStr = formData.start_date;
      const endDateStr = formData.end_date;
      
      console.log('Date validation debug:');
      console.log('Raw start_date:', startDateStr);
      console.log('Raw end_date:', endDateStr);
      
      // Create date objects in local timezone
      const startDate = new Date(startDateStr + 'T00:00:00');
      const endDate = new Date(endDateStr + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day
      
      // Check if dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        setError('Please enter valid dates');
        setLoading(false);
        return;
      }

      // Create comparable date objects (using date strings to avoid timezone issues)
      const startDateOnly = startDate;
      const endDateOnly = endDate;
      const todayOnly = today;

      // Check if start date is not in the past (allow today)
      if (startDateOnly < todayOnly) {
        setError(`Start date cannot be in the past. Selected: ${startDateOnly.toDateString()}, Today: ${todayOnly.toDateString()}`);
        setLoading(false);
        return;
      }

      // Check if end date is after start date
      if (endDateOnly <= startDateOnly) {
        setError('End date must be after start date');
        setLoading(false);
        return;
      }
      
      console.log('Date validation passed successfully!');
    } catch (dateError) {
      console.error('Date validation error:', dateError);
      setError('Invalid date format. Please check your dates.');
      setLoading(false);
      return;
    }

    try {
      // Generate session ID for tracking
      let sessionId = localStorage.getItem('freeTripSessionId');
      if (!sessionId) {
        sessionId = 'free_trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('freeTripSessionId', sessionId);
      }

      console.log('Form Data before submit:', formData);
      console.log('Selected Interests:', selectedInterests);
      console.log('Budget Value:', budgetValue);

      // Convert dates to ensure proper format (YYYY-MM-DD)
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };

      const submitData = {
        destination: formData.destination.trim(),
        start_date: formatDate(formData.start_date),
        end_date: formatDate(formData.end_date),
        budget: parseInt(budgetValue) || 1000,
        currency: 'USD',
        adults: parseInt(formData.number_of_travelers) || 1,
        children: 0,
        interests: selectedInterests.join(', '),
        session_id: sessionId,
        // Additional fields for backend compatibility
        accommodation_type: '',
        transportation_mode: '',
        description: `Free trip to ${formData.destination}${selectedInterests.length > 0 ? ` with interests in ${selectedInterests.join(', ')}` : ''}`,
        contact_name: '',
        contact_email: '',
      };

      console.log('Submitting free trip data:', submitData);
      console.log('Submitting as JSON:', JSON.stringify(submitData, null, 2));

      const response = await fetch('http://127.0.0.1:8000/api/free-trips/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Free trip response:', data);

      if (data.success) {
        console.log('Free trip saved successfully:', data.trip);
        
        // Navigate to enhanced map view
        navigate('/free-map', { 
          state: { 
            freeTrip: data.trip,
            sessionId: sessionId
          } 
        });
      } else {
        console.error('Server returned error:', data);
        setError(data.error || 'Failed to save trip. Please try again.');
      }
    } catch (err) {
      console.error('Error saving free trip:', err);
      setError('Network error. Please check your connection and try again. Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Plan Your Dream Trip</h1>
            <p className="text-gray-600">Tell us about your travel preferences and we'll create a personalized itinerary</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Destination */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="mr-2">📍</span>
                Where are you going?
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="Enter destination (e.g., Paris, Tokyo, New York)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2">📅</span>
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]} // Set minimum date to today
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2">📅</span>
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  min={formData.start_date || new Date().toISOString().split('T')[0]} // Set minimum to start date or today
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Number of Travelers */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="mr-2">👥</span>
                Number of Travelers
              </label>
              <select
                name="number_of_travelers"
                value={formData.number_of_travelers}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} traveler{i > 0 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Interests
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      selectedInterests.includes(interest)
                        ? 'bg-blue-600 text-white'
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
              <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <span className="mr-2">💰</span>
                Budget per person ($)
              </label>
              <div className="px-4">
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={budgetValue}
                  onChange={handleBudgetChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>$100</span>
                  <span className="font-medium text-blue-600">${budgetValue}</span>
                  <span>$5000</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Itinerary...
                  </div>
                ) : (
                  'Generate Itinerary'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          background: linear-gradient(to right, #e5e7eb 0%, #3b82f6 50%, #e5e7eb 100%);
          border-radius: 5px;
          outline: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: all .15s ease-in-out;
        }

        .slider::-webkit-slider-thumb:hover {
          background: #1d4ed8;
          transform: scale(1.1);
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb:hover {
          background: #1d4ed8;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default FreeTripPlanForm;
