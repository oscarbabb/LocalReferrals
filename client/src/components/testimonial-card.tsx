import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  rating: number;
  comment: string;
  author: string;
  location: string;
}

export default function TestimonialCard({ rating, comment, author, location }: TestimonialCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? "fill-current" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">{rating}.0</span>
        </div>
        
        <p className="text-gray-700 mb-4 italic">"{comment}"</p>
        
        <div className="flex items-center">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gray-300 text-gray-600">
              {getInitials(author)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{author}</p>
            <p className="text-xs text-gray-600">{location}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
