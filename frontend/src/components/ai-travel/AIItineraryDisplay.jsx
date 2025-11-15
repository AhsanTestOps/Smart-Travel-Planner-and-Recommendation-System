import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import ItineraryMap from '../ui/ItineraryMap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  MapPin, Calendar, DollarSign, Users, Clock, Star, 
  RefreshCw, Trash2, ArrowLeft, Download, Share2, 
  Utensils, Bed, Car, Plane, Camera, ShoppingBag,
  Loader2, AlertTriangle, CheckCircle, Map
} from 'lucide-react';
import { useAITravel } from '../../context/AITravelContext';

const AIItineraryDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Add error handling for context
  let getItinerary, deleteItinerary, regenerateBudget, loading = false, generationProgress = null;
  
  try {
    const aiTravelContext = useAITravel();
    getItinerary = aiTravelContext.getItinerary;
    deleteItinerary = aiTravelContext.deleteItinerary;
    regenerateBudget = aiTravelContext.regenerateBudget;
    loading = aiTravelContext.loading || false;
    generationProgress = aiTravelContext.generationProgress;
  } catch (error) {
    console.error('Error accessing AITravel context in display:', error);
    // Provide fallback functions
    getItinerary = async () => { throw new Error('Context not available'); };
    deleteItinerary = async () => { throw new Error('Context not available'); };
    regenerateBudget = async () => { throw new Error('Context not available'); };
  }
  
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState('');
  const [expandedDays, setExpandedDays] = useState(new Set([0])); // First day expanded by default
  const [showBudgetDetails, setShowBudgetDetails] = useState(false);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    loadItinerary();
  }, [id]);

  const loadItinerary = async () => {
    try {
      setError('');
      console.log('🔍 Loading itinerary with ID:', id);
      
      const data = await getItinerary(id);
      
      console.log('📦 Received data from API:', {
        success: data ? 'received' : 'null',
        hasItinerary: data?.itinerary ? 'yes' : 'no',
        destination: data?.itinerary?.destination,
        contentExists: data?.itinerary?.itinerary_content ? 'yes' : 'no',
        dailyScheduleLength: data?.itinerary?.itinerary_content?.daily_schedule?.length || 0
      });
      
      setItinerary(data);
    } catch (err) {
      console.error('❌ Error loading itinerary:', err);
      setError(err.message || 'Failed to load itinerary');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }
    
    try {
      await deleteItinerary(id);
      navigate('/ai-travel/history');
    } catch (err) {
      setError('Failed to delete itinerary');
    }
  };

  const handleRegenerateBudget = async () => {
    setBudgetLoading(true);
    try {
      const newBudget = await regenerateBudget(id);
      setItinerary(prev => ({
        ...prev,
        detailed_budget: newBudget
      }));
    } catch (err) {
      setError('Failed to regenerate budget');
    } finally {
      setBudgetLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      // Helper functions for formatting
      const formatCurrencyPDF = (amount) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(amount);
      };

      const formatDatePDF = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      // Create a printable version of the itinerary
      const printWindow = window.open('', '_blank');
      const itineraryData = itinerary.itinerary;
      const content = itineraryData.itinerary_content;
      const dailySchedule = content?.daily_schedule || [];
      const recommendations = content?.recommendations || {};
      
      // Generate HTML for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${itineraryData.destination} - Travel Itinerary</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
            }
            .header h1 { 
              color: #3b82f6; 
              font-size: 36px; 
              margin-bottom: 10px;
            }
            .trip-info { 
              display: flex; 
              justify-content: center; 
              gap: 30px; 
              margin: 20px 0;
              flex-wrap: wrap;
            }
            .trip-info-item { 
              background: #f3f4f6; 
              padding: 10px 20px; 
              border-radius: 8px;
            }
            .trip-info-item strong { color: #3b82f6; }
            .overview { 
              background: #eff6ff; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 30px 0;
              border-left: 4px solid #3b82f6;
            }
            .day-section { 
              margin: 30px 0; 
              page-break-inside: avoid;
            }
            .day-header { 
              background: #3b82f6; 
              color: white; 
              padding: 15px 20px; 
              border-radius: 8px 8px 0 0;
              font-size: 20px;
              font-weight: bold;
            }
            .day-content { 
              background: #f9fafb; 
              padding: 20px; 
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .activity { 
              background: white; 
              padding: 15px; 
              margin: 15px 0; 
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .activity-time { 
              color: #3b82f6; 
              font-weight: bold; 
              font-size: 16px;
              margin-bottom: 5px;
            }
            .activity-name { 
              font-weight: bold; 
              font-size: 18px; 
              margin-bottom: 8px;
            }
            .activity-description { 
              color: #6b7280; 
              margin: 8px 0;
            }
            .activity-location { 
              color: #059669; 
              margin-top: 8px;
            }
            .activity-cost { 
              background: #fef3c7; 
              color: #92400e; 
              padding: 5px 10px; 
              border-radius: 4px;
              display: inline-block;
              margin-top: 8px;
              font-weight: bold;
            }
            .recommendations { 
              margin-top: 40px; 
              page-break-before: always;
            }
            .rec-section { 
              margin: 25px 0;
            }
            .rec-title { 
              color: #3b82f6; 
              font-size: 22px; 
              font-weight: bold; 
              margin-bottom: 15px;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 8px;
            }
            .rec-item { 
              background: #f9fafb; 
              padding: 12px 15px; 
              margin: 8px 0; 
              border-radius: 6px;
              border-left: 3px solid #3b82f6;
            }
            .budget-section {
              margin-top: 40px;
              page-break-before: always;
            }
            .budget-title {
              color: #3b82f6;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .budget-item {
              display: flex;
              justify-content: space-between;
              padding: 12px;
              background: #f9fafb;
              margin: 8px 0;
              border-radius: 6px;
            }
            .budget-total {
              background: #3b82f6;
              color: white;
              padding: 15px;
              border-radius: 8px;
              font-size: 20px;
              font-weight: bold;
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌍 ${itineraryData.destination}</h1>
            <p style="font-size: 18px; color: #6b7280;">Your Complete Travel Itinerary</p>
          </div>

          <div class="trip-info">
            <div class="trip-info-item">
              <strong>📅 Dates:</strong> ${formatDatePDF(itineraryData.start_date)} - ${formatDatePDF(itineraryData.end_date)}
            </div>
            <div class="trip-info-item">
              <strong>👥 Travelers:</strong> ${itineraryData.total_travelers || itineraryData.adults || 1}
            </div>
            <div class="trip-info-item">
              <strong>💰 Budget:</strong> ${formatCurrencyPDF(itineraryData.budget_amount || itineraryData.budget_usd)}
            </div>
            <div class="trip-info-item">
              <strong>🎯 Style:</strong> ${itineraryData.travel_style.replace('_', ' ')}
            </div>
          </div>

          ${content.overview ? `
          <div class="overview">
            <h2 style="margin-bottom: 10px; color: #3b82f6;">📝 Trip Overview</h2>
            <p>${content.overview}</p>
          </div>
          ` : ''}

          <div style="margin-top: 40px;">
            <h2 style="color: #3b82f6; font-size: 28px; margin-bottom: 20px;">📅 Daily Schedule</h2>
            ${dailySchedule.map((day, index) => `
              <div class="day-section">
                <div class="day-header">
                  Day ${day.day} - ${formatDatePDF(day.date)} ${day.title ? `- ${day.title}` : ''}
                </div>
                <div class="day-content">
                  ${day.theme ? `<p style="color: #6b7280; margin-bottom: 15px; font-style: italic;">${day.theme}</p>` : ''}
                  ${day.activities && day.activities.length > 0 ? day.activities.map(activity => `
                    <div class="activity">
                      ${activity.time ? `<div class="activity-time">⏰ ${activity.time}</div>` : ''}
                      <div class="activity-name">${activity.activity || activity.name}</div>
                      ${activity.description ? `<div class="activity-description">${activity.description}</div>` : ''}
                      ${activity.location || activity.area ? `<div class="activity-location">📍 ${activity.location || activity.area}</div>` : ''}
                      ${activity.estimated_cost ? `<div class="activity-cost">$${activity.estimated_cost}</div>` : ''}
                    </div>
                  `).join('') : '<p style="color: #6b7280;">No activities scheduled</p>'}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="recommendations">
            <h2 style="color: #3b82f6; font-size: 28px; margin-bottom: 20px;">💡 Recommendations & Tips</h2>
            
            ${recommendations.budget_tips && recommendations.budget_tips.length > 0 ? `
            <div class="rec-section">
              <div class="rec-title">💰 Budget Tips</div>
              ${recommendations.budget_tips.map(tip => `<div class="rec-item">${tip}</div>`).join('')}
            </div>
            ` : ''}

            ${recommendations.cultural_tips && recommendations.cultural_tips.length > 0 ? `
            <div class="rec-section">
              <div class="rec-title">🎎 Cultural Tips</div>
              ${recommendations.cultural_tips.map(tip => `<div class="rec-item">${tip}</div>`).join('')}
            </div>
            ` : ''}

            ${recommendations.local_cuisine && recommendations.local_cuisine.length > 0 ? `
            <div class="rec-section">
              <div class="rec-title">🍜 Local Cuisine</div>
              ${recommendations.local_cuisine.map(tip => `<div class="rec-item">${tip}</div>`).join('')}
            </div>
            ` : ''}

            ${recommendations.must_visit_attractions && recommendations.must_visit_attractions.length > 0 ? `
            <div class="rec-section">
              <div class="rec-title">🏛️ Must-Visit Attractions</div>
              ${recommendations.must_visit_attractions.map(tip => `<div class="rec-item">${tip}</div>`).join('')}
            </div>
            ` : ''}

            ${recommendations.must_try_restaurants && recommendations.must_try_restaurants.length > 0 ? `
            <div class="rec-section">
              <div class="rec-title">🍽️ Must-Try Restaurants</div>
              ${recommendations.must_try_restaurants.map(tip => `<div class="rec-item">${tip}</div>`).join('')}
            </div>
            ` : ''}

            ${recommendations.hidden_gems && recommendations.hidden_gems.length > 0 ? `
            <div class="rec-section">
              <div class="rec-title">💎 Hidden Gems</div>
              ${recommendations.hidden_gems.map(tip => `<div class="rec-item">${tip}</div>`).join('')}
            </div>
            ` : ''}
          </div>

          ${content.budget_breakdown ? `
          <div class="budget-section">
            <div class="budget-title">💵 Budget Breakdown</div>
            ${Object.entries(content.budget_breakdown).map(([key, value]) => `
              <div class="budget-item">
                <span>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                <span><strong>${formatCurrencyPDF(value)}</strong></span>
              </div>
            `).join('')}
            <div class="budget-total">
              <span>Total Estimated Cost</span>
              <span>${formatCurrencyPDF(content.total_estimated_cost || 0)}</span>
            </div>
          </div>
          ` : ''}

          <div style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280;">
            <p>Generated by Smart Travel Planner</p>
            <p style="margin-top: 5px;">Happy Travels! ✈️🌎</p>
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
              📄 Save as PDF / Print
            </button>
            <button onclick="window.close()" style="background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Auto-trigger print dialog
      printWindow.onload = () => {
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
      
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export itinerary');
    } finally {
      setExportLoading(false);
    }
  };

  const handleShare = () => {
    // Generate shareable link
    const currentUrl = window.location.href;
    setShareLink(currentUrl);
    setShowShareModal(true);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  const shareToSocial = (platform) => {
    const url = encodeURIComponent(shareLink);
    const text = encodeURIComponent(`Check out my ${itinerary?.itinerary?.destination} travel itinerary!`);
    
    const socialUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing via URL
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      email: `mailto:?subject=${text}&body=${text}%20${url}`
    };
    
    if (platform === 'instagram') {
      alert('To share on Instagram:\n1. Take a screenshot of your itinerary\n2. Open Instagram app\n3. Create a new post or story\n4. Upload the screenshot');
      return;
    }
    
    window.open(socialUrls[platform], '_blank', 'width=600,height=400');
  };

  const toggleDay = (dayIndex) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayIndex)) {
      newExpanded.delete(dayIndex);
    } else {
      newExpanded.add(dayIndex);
    }
    setExpandedDays(newExpanded);
  };

  const expandAllDays = () => {
    if (dailySchedule && dailySchedule.length > 0) {
      setExpandedDays(new Set(dailySchedule.map((_, i) => i)));
    }
  };

  const collapseAllDays = () => {
    setExpandedDays(new Set());
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      'food': Utensils,
      'accommodation': Bed,
      'transport': Car,
      'flight': Plane,
      'sightseeing': Camera,
      'shopping': ShoppingBag,
      'activity': Star
    };
    return iconMap[type] || Star;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayNumber = (dateString, startDate) => {
    const start = new Date(startDate);
    const current = new Date(dateString);
    const diffTime = current - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  if (loading && !itinerary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your itinerary...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !itinerary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/ai-travel')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Travel
          </Button>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return null;
  }

  // Fix data extraction - the API returns the itinerary directly, not nested
  const itineraryData = itinerary || {};
  const detailed_budget = itinerary?.detailed_budget;
  
  // Extract the actual itinerary content with daily schedule
  const itineraryContent = itineraryData?.itinerary_content || {};
  const dailySchedule = itineraryContent.daily_schedule || [];
  const overview = itineraryContent.overview || '';
  const recommendations = itineraryContent.recommendations || {};
  const images = itineraryContent.images || [];

  // Debug logging to console
  console.log('🎯 AIItineraryDisplay Debug:', {
    itineraryData: itineraryData ? 'exists' : 'missing',
    contentKeys: Object.keys(itineraryContent),
    dailyScheduleLength: dailySchedule.length,
    overviewLength: overview.length,
    recommendationsKeys: Object.keys(recommendations)
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          onClick={() => navigate('/ai-travel/history')} 
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleShare}
            disabled={!itinerary}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="outline" 
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generationProgress && (
        <Alert className="mb-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>{generationProgress}</AlertDescription>
        </Alert>
      )}

      {/* Two-column layout: Content on left, Map on right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content - Takes 2/3 of the width on large screens */}
        <div className="xl:col-span-2 space-y-6">
          {/* Trip Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl mb-2">
                    <MapPin className="h-6 w-6 text-blue-600" />
                    {itineraryData.destination}
                  </CardTitle>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(itineraryData.start_date)} - {formatDate(itineraryData.end_date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {itineraryData.total_travelers || itineraryData.group_size || itineraryData.adults || 1} {(itineraryData.total_travelers || itineraryData.group_size || itineraryData.adults || 1) === 1 ? 'traveler' : 'travelers'}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Budget: {formatCurrency(itineraryData.budget_amount || itineraryData.budget_usd)}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {itineraryData.travel_style.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            
            {overview && (
              <CardContent>
                <h3 className="font-semibold mb-2">Trip Overview</h3>
                <p className="text-gray-700 leading-relaxed">{overview}</p>
              </CardContent>
            )}
          </Card>

          {/* Daily Schedule */}
          {dailySchedule && dailySchedule.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Daily Schedule</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={expandAllDays} variant="outline" size="sm">
                      Expand All
                    </Button>
                    <Button onClick={collapseAllDays} variant="outline" size="sm">
                      Collapse All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {dailySchedule.map((day, index) => {
                  const isExpanded = expandedDays.has(index);
                  const dayNumber = getDayNumber(day.date, itineraryData.start_date);
                  return (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleDay(index)}
                        className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">
                              Day {dayNumber} - {formatDate(day.date)}
                            </h3>
                            {day.theme && (
                              <p className="text-sm text-gray-600 capitalize">{day.theme}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {day.activities && (
                              <Badge variant="outline">
                                {day.activities.length} activities
                              </Badge>
                            )}
                            <Clock className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="p-4 space-y-3">
                          {day.activities?.map((activity, actIndex) => {
                            const IconComponent = getActivityIcon(activity.type);
                            return (
                              <div key={actIndex} className="flex gap-3 p-3 bg-white rounded border">
                                <IconComponent className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-grow">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-medium">{activity.activity}</h4>
                                      {activity.time && (
                                        <p className="text-sm text-gray-600">{activity.time}</p>
                                      )}
                                      {activity.description && (
                                        <p className="text-sm text-gray-700 mt-1">{activity.description}</p>
                                      )}
                                      {activity.location && (
                                        <p className="text-sm text-gray-600 mt-1">📍 {activity.location}</p>
                                      )}
                                    </div>
                                    {activity.estimated_cost && (
                                      <Badge variant="outline">
                                        {formatCurrency(activity.estimated_cost)}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Budget Breakdown */}
          {detailed_budget && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Budget Breakdown
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowBudgetDetails(!showBudgetDetails)}
                      variant="outline"
                      size="sm"
                    >
                      {showBudgetDetails ? 'Hide Details' : 'Show Details'}
                    </Button>
                    <Button
                      onClick={handleRegenerateBudget}
                      variant="outline"
                      size="sm"
                      disabled={budgetLoading}
                    >
                      {budgetLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Regenerate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {Object.entries(detailed_budget.categories || {}).map(([category, amount]) => (
                    <div key={category} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium capitalize text-sm">{category.replace('_', ' ')}</h4>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(amount)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="font-semibold">Total Estimated Cost:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {(() => {
                      // Try multiple sources for total cost
                      const contentBudget = itineraryContent.budget_breakdown?.total_estimates;
                      const rootBudget = itinerary.budget_breakdown?.total_estimates;
                      const contentTotal = itineraryContent.total_estimated_cost;
                      
                      if (contentTotal && contentTotal > 0) {
                        return formatCurrency(contentTotal);
                      } else if (contentBudget?.luxury_total) {
                        return formatCurrency(contentBudget.luxury_total);
                      } else if (contentBudget?.budget_total) {
                        return formatCurrency(contentBudget.budget_total);
                      } else if (rootBudget?.luxury_total) {
                        return formatCurrency(rootBudget.luxury_total);
                      } else if (rootBudget?.budget_total) {
                        return formatCurrency(rootBudget.budget_total);
                      } else if (detailed_budget?.total_estimated) {
                        return formatCurrency(detailed_budget.total_estimated);
                      } else {
                        return 'Calculating...';
                      }
                    })()}
                  </span>
                </div>

                {detailed_budget.budget_comparison && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Budget Analysis:</h4>
                    <p className="text-sm text-gray-700">{detailed_budget.budget_comparison}</p>
                  </div>
                )}
                
                {showBudgetDetails && detailed_budget.breakdown && (
                  <div className="mt-4 space-y-3">
                    <Separator />
                    <h4 className="font-medium">Detailed Breakdown:</h4>
                    {Object.entries(detailed_budget.breakdown).map(([item, details]) => (
                      <div key={item} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <span className="font-medium capitalize">{item.replace('_', ' ')}</span>
                          {details.description && (
                            <p className="text-sm text-gray-600">{details.description}</p>
                          )}
                        </div>
                        <span className="font-medium">{formatCurrency(details.cost)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations && Object.keys(recommendations).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-600" />
                  Recommendations
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Explore top-rated locations and insider tips
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Budget Tips */}
                {recommendations.budget_tips && recommendations.budget_tips.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Budget Tips
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recommendations.budget_tips.map((tip, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700">
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cultural Tips */}
                {recommendations.cultural_tips && recommendations.cultural_tips.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-base mb-3">Cultural Tips</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recommendations.cultural_tips.map((tip, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700">
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Local Cuisine */}
                {recommendations.local_cuisine && recommendations.local_cuisine.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-base mb-3">Local Cuisine</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recommendations.local_cuisine.map((cuisine, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700">
                          {cuisine}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Must Try Restaurants */}
                {recommendations.must_try_restaurants && recommendations.must_try_restaurants.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-base mb-3">Must Try Restaurants</h3>
                    <div className="space-y-2">
                      {recommendations.must_try_restaurants.map((restaurant, index) => (
                        <div key={index} className="p-3 bg-orange-50 rounded border border-orange-200">
                          <p className="text-sm text-gray-800 font-medium">{restaurant}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Must Visit Attractions */}
                {recommendations.must_visit_attractions && recommendations.must_visit_attractions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-base mb-3">Must Visit Attractions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recommendations.must_visit_attractions.map((attraction, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded border border-blue-200 text-sm text-gray-700">
                          {attraction}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hidden Gems */}
                {recommendations.hidden_gems && recommendations.hidden_gems.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-base mb-3">Hidden Gems</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recommendations.hidden_gems.map((gem, index) => (
                        <div key={index} className="p-3 bg-purple-50 rounded border border-purple-200 text-sm text-gray-700">
                          {gem}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Generation Info */}
          <div className="text-center text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Generated on {new Date(itineraryData.created_at).toLocaleDateString()}
            </div>
            <p className="mt-1">
              Powered by AI • Trip ID: {itineraryData.id.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* Map Sidebar - Takes 1/3 of the width on large screens */}
        <div className="xl:col-span-1 space-y-6">
          <div className="sticky top-6 space-y-6">
            {/* Route Optimization Map */}
            {dailySchedule && dailySchedule.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-blue-600" />
                    Route Optimization
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Day-by-day travel routes
                  </p>
                </CardHeader>
                <CardContent>
                  <ItineraryMap
                    itinerary={itineraryData}
                    dailySchedule={dailySchedule}
                    recommendations={{}} // Empty recommendations for route map
                    className="w-full h-[500px] rounded-lg border shadow-md"
                    showRoutes={true}
                  />
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-sm">Activity Types:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span>🏛️</span> Sightseeing
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🍽️</span> Food & Dining
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🛍️</span> Shopping
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🏔️</span> Adventure
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🎭</span> Cultural
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📍</span> Attractions
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations Map */}
            {recommendations && Object.keys(recommendations).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-600" />
                    Recommended Places
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Explore top-rated locations
                  </p>
                </CardHeader>
                <CardContent>
                  <ItineraryMap
                    itinerary={itineraryData}
                    dailySchedule={[]} // Empty schedule for recommendations map
                    recommendations={recommendations}
                    className="w-full h-[500px] rounded-lg border shadow-md"
                    showRoutes={false}
                  />
                  <div className="mt-4 space-y-3">
                    {/* Map Legend */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Map Legend:</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                          <span className="text-lg">🏛️</span>
                          <span className="font-medium text-gray-700">Sightseeing</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                          <span className="text-lg">🍽️</span>
                          <span className="font-medium text-gray-700">Food & Dining</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-purple-50 rounded border border-purple-200">
                          <span className="text-lg">🛍️</span>
                          <span className="font-medium text-gray-700">Shopping</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                          <span className="text-lg">🏔️</span>
                          <span className="font-medium text-gray-700">Adventure</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                          <span className="text-lg">🎭</span>
                          <span className="font-medium text-gray-700">Cultural</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                          <span className="text-lg">📍</span>
                          <span className="font-medium text-gray-700">Attractions</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recommendation Categories */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Recommendation Categories:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(recommendations).map((category) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Share Your Itinerary</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Social Media Buttons */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Share on social media:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => shareToSocial('facebook')}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                  
                  <button
                    onClick={() => shareToSocial('twitter')}
                    className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter
                  </button>
                  
                  <button
                    onClick={() => shareToSocial('instagram')}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </button>
                  
                  <button
                    onClick={() => shareToSocial('whatsapp')}
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </button>
                </div>
              </div>

              {/* Copy Link */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Or copy link:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                  />
                  <Button
                    onClick={() => copyToClipboard(shareLink)}
                    variant="outline"
                    size="sm"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* Email Share */}
              <button
                onClick={() => shareToSocial('email')}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Share via Email
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Share your amazing travel plans with friends and family!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIItineraryDisplay;
