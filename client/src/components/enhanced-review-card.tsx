import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, ThumbsUp } from "lucide-react";
import { parseSafeDate } from "@/lib/date-utils";
import { useLanguage } from "@/hooks/use-language";
import type { Review } from "@shared/schema";

interface EnhancedReviewCardProps {
  review: Review & { 
    reviewer?: { 
      fullName: string; 
      avatar?: string | null; 
      building?: string | null;
      apartment?: string | null;
    } 
  };
}

function StarRating({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function DetailedRatings({ review }: { review: Review }) {
  const { t } = useLanguage();
  
  const ratings = [
    { label: t('components.enhancedReview.serviceQuality'), value: review.serviceQuality },
    { label: t('components.enhancedReview.communication'), value: review.communication },
    { label: t('components.enhancedReview.punctuality'), value: review.punctuality },
    { label: t('components.enhancedReview.valueForMoney'), value: review.valueForMoney },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {ratings.map(({ label, value }) => 
        value && (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{label}</span>
            <StarRating rating={value} size="w-3 h-3" />
          </div>
        )
      )}
    </div>
  );
}

function PhotoGallery({ photos }: { photos: string[] }) {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <div key={index} className="relative">
            <img
              src={photo}
              alt={`Review photo ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              data-testid={`img-review-photo-${index}`}
              onClick={() => window.open(photo, '_blank')}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EnhancedReviewCard({ review }: EnhancedReviewCardProps) {
  const { t } = useLanguage();
  const reviewDate = parseSafeDate(review.createdAt).toLocaleDateString();
  const hasDetailedRatings = review.serviceQuality || review.communication || 
                            review.punctuality || review.valueForMoney;

  return (
    <Card className="w-full" data-testid={`card-review-${review.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={review.reviewer?.avatar || undefined} />
            <AvatarFallback>
              {review.reviewer?.fullName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            {/* Header with name, rating, and badges */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-gray-900" data-testid="text-reviewer-name">
                    {review.reviewer?.fullName || 'Anonymous'}
                  </h4>
                  {review.isVerified && (
                    <Badge variant="secondary" className="text-green-600 bg-green-50">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {t('components.enhancedReview.verified')}
                    </Badge>
                  )}
                  {review.wouldRecommend && (
                    <Badge variant="secondary" className="text-blue-600 bg-blue-50">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {t('components.enhancedReview.recommends')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {review.reviewer?.building && review.reviewer?.apartment && (
                    <span data-testid="text-reviewer-location">
                      {review.reviewer.building}, Apt {review.reviewer.apartment}
                    </span>
                  )}
                  <span>•</span>
                  <span data-testid="text-review-date">{reviewDate}</span>
                </div>
              </div>
              
              <div className="text-right">
                <StarRating rating={review.rating} />
                <div className="text-sm text-gray-500 mt-1" data-testid="text-overall-rating">
                  {review.rating}/5 {t('components.enhancedReview.general')}
                </div>
              </div>
            </div>

            {/* Written review */}
            {review.comment && (
              <p className="text-gray-700 leading-relaxed" data-testid="text-review-comment">
                {review.comment}
              </p>
            )}

            {/* Detailed ratings */}
            {hasDetailedRatings && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">{t('components.enhancedReview.detailedRatings')}</h5>
                <DetailedRatings review={review} />
              </div>
            )}

            {/* Photo gallery */}
            <PhotoGallery photos={review.photos || []} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}