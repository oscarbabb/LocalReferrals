import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/use-language";

interface User {
  id: string;
  isAdmin?: boolean;
}

interface UnreadData {
  count: number;
}

export default function MessageAlertMonitor() {
  const { user } = useAuth() as { user: User | null };
  const { toast } = useToast();
  const { t } = useLanguage();
  const previousCountRef = useRef<number | null>(null);
  const isInitialLoadRef = useRef(true);

  // Fetch unread count based on user type - use the same queries as Header to avoid duplication
  const { data: unreadData } = useQuery<UnreadData>({
    queryKey: user?.isAdmin 
      ? [`/api/admin-messages/admin-unread-count`]
      : [`/api/messages/user/${user?.id}/unread-count`],
    enabled: !!user?.id,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const currentCount = unreadData?.count ?? 0;

  useEffect(() => {
    // Skip the initial load to avoid showing alert on page refresh
    if (isInitialLoadRef.current) {
      previousCountRef.current = currentCount;
      isInitialLoadRef.current = false;
      return;
    }

    // Check if count increased (new message received)
    if (previousCountRef.current !== null && currentCount > previousCountRef.current) {
      const newMessagesCount = currentCount - previousCountRef.current;
      
      toast({
        title: t('messages.newMessageAlert.title'),
        description: t('messages.newMessageAlert.description').replace('{{count}}', newMessagesCount.toString()),
        duration: 5000,
      });
    }

    // Update previous count
    previousCountRef.current = currentCount;
  }, [currentCount, toast, t]);

  // This component doesn't render anything
  return null;
}
