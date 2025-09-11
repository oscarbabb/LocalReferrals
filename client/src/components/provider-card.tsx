import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin } from "lucide-react";
import { Link } from "wouter";

interface Provider {
  id: string;
  title: string;
  description: string;
  hourlyRate: string;
  user: {
    fullName: string;
    building: string;
    apartment: string;
    avatar?: string;
  };
  averageRating: number;
  reviewCount: number;
}

interface ProviderCardProps {
  provider: Provider;
  categoryName?: string;
}

export default function ProviderCard({ provider, categoryName }: ProviderCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="h-full card-animate hover-lift hover-glow group">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="w-12 h-12">
            {provider.user?.avatar && (
              <AvatarImage 
                src={provider.user.avatar} 
                alt={provider.user.fullName}
                data-testid={`img-provider-avatar-${provider.id}`}
              />
            )}
            <AvatarFallback className="bg-primary text-white">
              {getInitials(provider.user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{provider.user.fullName}</h3>
              {categoryName && (
                <Badge variant="secondary" className="text-xs">
                  {categoryName}
                </Badge>
              )}
            </div>
            {provider.averageRating > 0 && (
              <div className="flex items-center mb-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{provider.averageRating}</span>
                  <span className="text-xs text-gray-500">({provider.reviewCount} reseñas)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <h4 className="font-medium text-gray-900 mb-2">{provider.title}</h4>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{provider.description}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{provider.user.building}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">
              MXN ${provider.hourlyRate}
            </span>
            <span className="text-sm text-gray-500">/hora</span>
          </div>
        </div>

        <Link href={`/providers/${provider.id}`}>
          <Button className="w-full bg-primary text-white hover:bg-blue-700 btn-animate hover-scale" data-testid="button-view-profile">
            Ver Perfil
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
