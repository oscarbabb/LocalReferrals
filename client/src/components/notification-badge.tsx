import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
}

export default function NotificationBadge({ count, className, maxCount = 99 }: NotificationBadgeProps) {
  if (count === 0) return null;
  
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  
  return (
    <span 
      className={cn(
        "absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-background",
        className
      )}
      data-testid="notification-badge"
    >
      {displayCount}
    </span>
  );
}
