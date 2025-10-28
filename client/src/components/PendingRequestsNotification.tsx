import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X, Bell } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";

export default function PendingRequestsNotification() {
  const [, setLocation] = useLocation();
  const [isDismissed, setIsDismissed] = useState(false);
  const { t } = useLanguage();

  // Query for pending requests count
  const { data: pendingData } = useQuery<{ count: number }>({
    queryKey: ["/api/service-requests/pending/count"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const pendingCount = pendingData?.count || 0;

  // Don't show if dismissed or no pending requests
  if (isDismissed || pendingCount === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg"
      data-testid="notification-pending-requests"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-shrink-0">
              <div className="bg-white/20 rounded-full p-2">
                <Bell className="w-6 h-6 text-white animate-pulse" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-lg">
                {pendingCount === 1
                  ? t('common.notifications.newRequest')
                  : t('common.notifications.newRequests').replace('{count}', pendingCount.toString())}
              </p>
              <p className="text-white/90 text-sm">
                {t('common.notifications.reviewMessage')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => {
                setIsDismissed(true);
                setLocation("/bookings");
              }}
              className="bg-white text-orange-600 hover:bg-gray-100 font-semibold shadow-md"
              data-testid="button-view-requests"
            >
              {t('common.notifications.takeMeThere')}
            </Button>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
              data-testid="button-dismiss-notification"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
