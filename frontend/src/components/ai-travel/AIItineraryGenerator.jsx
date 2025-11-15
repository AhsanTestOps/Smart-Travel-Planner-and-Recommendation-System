import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, MapPin, Calendar, DollarSign, Compass, User, Sparkles } from 'lucide-react';
import { useAITravel } from '../../context/AITravelContext';
import { useAuth } from '../../context/AuthContext';

// Helper functions to map frontend values to backend format
const mapBudgetToChoice = (amount) => {
  if (amount < 1000) return 'budget';
  if (amount < 3000) return 'mid-range';
  return 'luxury';
};

const mapTravelStyleToBackend = (frontendStyle) => {
  // Direct mapping since we'll update the frontend to use backend values
  return frontendStyle;
};

const AIItineraryGenerator = () => {
  const navigate = useNavigate();
  const { generateAIItinerary, loading, generationProgress } = useAITravel();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    budget_usd: '',
    travel_style: '',
    group_size: 1,
    interests: '',
    special_requirements: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const travelStyles = [
    { value: 'cultural', label: 'Cultural' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'relaxation', label: 'Relaxation' },
    { value: 'family', label: 'Family' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'solo', label: 'Solo Travel' },
    { value: 'business', label: 'Business' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end <= start) {
        newErrors.end_date = 'End date must be after start date';
      }
    }
    
    if (!formData.budget_usd || parseFloat(formData.budget_usd) <= 0) {
      newErrors.budget_usd = 'Please enter a valid budget amount';
    }
    
    if (!formData.travel_style) {
      newErrors.travel_style = 'Please select a travel style';
    }
    
    if (!formData.group_size || formData.group_size < 1) {
      newErrors.group_size = 'Group size must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      // Map frontend data to backend format
      const submitData = {
        destination: formData.destination.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        duration_days: getTripDuration(),
        adults: parseInt(formData.group_size) || 1,
        children: 0, // For now, assume no children
        group_size: parseInt(formData.group_size) || 1, // Add group_size for backend compatibility
        budget: mapBudgetToChoice(parseFloat(formData.budget_usd)),
        budget_amount: parseFloat(formData.budget_usd),
        currency: 'USD',
        travel_style: formData.travel_style,
        interests: formData.interests ? 
          formData.interests.split(',').map(item => item.trim()).filter(item => item.length > 0) : [],
        accommodation_preference: '',
        transportation_preference: '',
      };

      console.log('Submitting AI itinerary data:', submitData);

      const itinerary = await generateAIItinerary(submitData);
      
      // Navigate to the generated itinerary
      navigate(`/ai-travel/itinerary/${itinerary.id}`);
    } catch (err) {
      setSubmitError(err.message || 'Failed to generate itinerary. Please try again.');
    }
  };

  // Calculate trip duration
  const getTripDuration = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const tripDays = getTripDuration();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-purple-600" />
              AI-Powered Itinerary Generator
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Let our AI create the perfect personalized travel itinerary for your next adventure
            </p>
          </CardHeader>
          
          <CardContent>
            {!isAuthenticated && (
              <Alert className="mb-6">
                <AlertDescription>
                  💡 Create an account to save your itineraries and access them anytime!
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Trip Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="destination" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Destination *
                  </Label>
                  <Input
                    id="destination"
                    name="destination"
                    type="text"
                    placeholder="e.g., Paris, France"
                    value={formData.destination}
                    onChange={handleInputChange}
                    className={errors.destination ? "border-red-500" : ""}
                  />
                  {errors.destination && (
                    <p className="text-red-500 text-sm">{errors.destination}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget_usd" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Budget (USD) *
                  </Label>
                  <Input
                    id="budget_usd"
                    name="budget_usd"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="1000"
                    value={formData.budget_usd}
                    onChange={handleInputChange}
                    className={errors.budget_usd ? "border-red-500" : ""}
                  />
                  {errors.budget_usd && (
                    <p className="text-red-500 text-sm">{errors.budget_usd}</p>
                  )}
                </div>
              </div>

              {/* Travel Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start Date *
                  </Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className={errors.start_date ? "border-red-500" : ""}
                  />
                  {errors.start_date && (
                    <p className="text-red-500 text-sm">{errors.start_date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    End Date *
                  </Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className={errors.end_date ? "border-red-500" : ""}
                  />
                  {errors.end_date && (
                    <p className="text-red-500 text-sm">{errors.end_date}</p>
                  )}
                </div>
              </div>

              {tripDays > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                  Trip duration: {tripDays} {tripDays === 1 ? 'day' : 'days'}
                </div>
              )}

              {/* Travel Style & Group Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    Travel Style *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {travelStyles.map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() => handleSelectChange('travel_style', style.value)}
                        className={`p-3 rounded-lg border-2 text-left text-sm transition-all ${
                          formData.travel_style === style.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                  {errors.travel_style && (
                    <p className="text-red-500 text-sm">{errors.travel_style}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group_size" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Group Size *
                  </Label>
                  <Input
                    id="group_size"
                    name="group_size"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.group_size}
                    onChange={handleInputChange}
                    className={errors.group_size ? "border-red-500" : ""}
                  />
                  {errors.group_size && (
                    <p className="text-red-500 text-sm">{errors.group_size}</p>
                  )}
                </div>
              </div>

              {/* Interests & Preferences */}
              <div className="space-y-2">
                <Label htmlFor="interests">
                  Interests & Activities
                </Label>
                <Textarea
                  id="interests"
                  name="interests"
                  placeholder="Enter interests separated by commas (e.g., museums, hiking, local cuisine, nightlife, shopping)"
                  value={formData.interests}
                  onChange={handleInputChange}
                  className="h-20"
                />
              </div>

              {/* Special Requirements */}
              <div className="space-y-2">
                <Label htmlFor="special_requirements">
                  Special Requirements (Optional)
                </Label>
                <Textarea
                  id="special_requirements"
                  name="special_requirements"
                  placeholder="Dietary restrictions, accessibility needs, specific preferences..."
                  value={formData.special_requirements}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {generationProgress && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>{generationProgress}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Your Perfect Itinerary...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Itinerary
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIItineraryGenerator;
