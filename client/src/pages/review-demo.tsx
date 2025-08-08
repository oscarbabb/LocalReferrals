import { useState } from "react";
import Header from "@/components/header";
import AdvancedReviewForm from "@/components/advanced-review-form";
import EnhancedReviewCard from "@/components/enhanced-review-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Camera, Users } from "lucide-react";

// Mock data for demonstration
const sampleReviews = [
  {
    id: "1",
    providerId: "provider-1",
    reviewerId: "reviewer-1",
    rating: 5,
    comment: "Excelente servicio de limpieza! María llegó puntual, trajo todos sus materiales y dejó mi apartamento impecable. Muy profesional y confiable. Definitivamente la recomiendo a otros vecinos.",
    photos: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop",
    ],
    serviceQuality: 5,
    communication: 5,
    punctuality: 5,
    valueForMoney: 4,
    wouldRecommend: true,
    isVerified: true,
    createdAt: new Date("2024-01-15"),
    reviewer: {
      fullName: "Ana Rodríguez",
      avatar: null,
      building: "Edificio A",
      apartment: "301"
    }
  },
  {
    id: "2", 
    providerId: "provider-1",
    reviewerId: "reviewer-2",
    rating: 4,
    comment: "Muy buen trabajo de reparación del grifo. Carlos conoce bien su oficio y fue muy explicativo sobre el problema y la solución.",
    photos: [
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=300&h=200&fit=crop"
    ],
    serviceQuality: 5,
    communication: 4,
    punctuality: 4,
    valueForMoney: 4,
    wouldRecommend: true,
    isVerified: true,
    createdAt: new Date("2024-01-10"),
    reviewer: {
      fullName: "Diego Martín",
      avatar: null,
      building: "Edificio B",
      apartment: "205"
    }
  }
];

export default function ReviewDemo() {
  const [showReviewForm, setShowReviewForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-6">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Review System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience our enhanced review system with detailed ratings, photo uploads, and verified reviews for better community trust.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <Star className="w-10 h-10 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Detailed Ratings</h3>
              <p className="text-gray-600 text-sm">Rate service quality, communication, punctuality, and value separately</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Camera className="w-10 h-10 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Photo Reviews</h3>
              <p className="text-gray-600 text-sm">Upload photos to show the quality of work and results</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="w-10 h-10 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Verified Reviews</h3>
              <p className="text-gray-600 text-sm">Reviews from completed services are marked as verified</p>
            </CardContent>
          </Card>
        </div>

        {/* Review Form Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Write a Review</span>
              <Badge variant="secondary">Demo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showReviewForm ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-6">
                  Try our advanced review form with detailed ratings and photo upload
                </p>
                <Button 
                  onClick={() => setShowReviewForm(true)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  data-testid="button-show-review-form"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Write a Review
                </Button>
              </div>
            ) : (
              <AdvancedReviewForm
                providerId="demo-provider"
                reviewerId="demo-user"
                onSubmit={() => {
                  setShowReviewForm(false);
                  // In a real app, this would refresh the reviews
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            )}
          </CardContent>
        </Card>

        {/* Sample Reviews */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Sample Reviews</h2>
            <Badge variant="outline">
              {sampleReviews.length} Reviews
            </Badge>
          </div>
          
          <div className="space-y-6">
            {sampleReviews.map((review) => (
              <EnhancedReviewCard
                key={review.id}
                review={review}
              />
            ))}
          </div>
        </div>

        {/* Implementation Notes */}
        <Card className="mt-12 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Implementation Features</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2">
              <li>✓ Enhanced database schema with detailed rating fields and photo arrays</li>
              <li>✓ Object storage integration for secure photo uploads</li>
              <li>✓ Advanced review form with 5-star ratings for different service aspects</li>
              <li>✓ Photo gallery with upload and management capabilities</li>
              <li>✓ Verification badges for completed service reviews</li>
              <li>✓ Recommendation system with visual indicators</li>
              <li>✓ Responsive design for mobile and desktop</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}