import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Inbox } from "lucide-react";
import MessagingModal from "@/components/messaging-modal";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Conversation } from "@shared/schema";

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const userId = (user as any)?.id;
  const [selectedConversation, setSelectedConversation] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  // Fetch user's conversations
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: [`/api/messages/user/${userId}`],
    enabled: !!userId && isAuthenticated,
  });

  // Format relative time in Spanish
  const formatTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { 
        addSuffix: true, 
        locale: es 
      });
    } catch {
      return "";
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Truncate message preview
  const truncateMessage = (message: string, maxLength: number = 60) => {
    if (message.length <= maxLength) return message;
    return message.slice(0, maxLength) + "...";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4" data-testid="page-messages">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Iniciar sesión requerido
            </h2>
            <p className="text-gray-600">
              Debes iniciar sesión para ver tus mensajes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" data-testid="page-messages">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Inbox className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Mis Mensajes</h1>
          </div>
          <p className="text-gray-600">
            Gestiona todas tus conversaciones en un solo lugar
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4" data-testid="loading-conversations">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-3 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && conversations.length === 0 && (
          <div className="text-center py-16" data-testid="empty-conversations">
            <MessageCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes conversaciones aún
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Cuando envíes o recibas mensajes, aparecerán aquí. Explora
              proveedores y comienza a chatear.
            </p>
          </div>
        )}

        {/* Conversations List */}
        {!isLoading && conversations.length > 0 && (
          <ScrollArea className="h-[calc(100vh-240px)]">
            <div className="space-y-3" data-testid="list-conversations">
              {conversations.map((conversation) => {
                const isUserSender = conversation.lastMessageSenderId === userId;
                
                return (
                  <Card
                    key={conversation.otherUserId}
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-orange-200"
                    onClick={() =>
                      setSelectedConversation({
                        userId: conversation.otherUserId,
                        userName: conversation.otherUserName,
                      })
                    }
                    data-testid={`card-conversation-${conversation.otherUserId}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <Avatar className="w-12 h-12">
                          <AvatarImage 
                            src={conversation.otherUserAvatar || undefined} 
                            alt={conversation.otherUserName}
                          />
                          <AvatarFallback className="bg-orange-100 text-orange-700">
                            {getInitials(conversation.otherUserName)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between mb-1">
                            <h3
                              className="text-base font-semibold text-gray-900 truncate"
                              data-testid={`text-conversation-name-${conversation.otherUserId}`}
                            >
                              {conversation.otherUserName}
                            </h3>
                            <span
                              className="text-xs text-gray-500 ml-2 whitespace-nowrap"
                              data-testid={`text-conversation-time-${conversation.otherUserId}`}
                            >
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                          <p
                            className="text-sm text-gray-600 truncate"
                            data-testid={`text-last-message-${conversation.otherUserId}`}
                          >
                            {isUserSender && (
                              <span className="text-orange-600 font-medium">Tú: </span>
                            )}
                            {truncateMessage(conversation.lastMessage)}
                          </p>
                        </div>

                        {/* Open Button (invisible but clickable) */}
                        <button
                          className="opacity-0 w-0 h-0"
                          aria-label="Abrir conversación"
                          data-testid={`button-open-conversation-${conversation.otherUserId}`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Messaging Modal */}
      {selectedConversation && (
        <MessagingModal
          open={!!selectedConversation}
          onOpenChange={(open) => {
            if (!open) setSelectedConversation(null);
          }}
          currentUserId={userId}
          recipientUserId={selectedConversation.userId}
          recipientName={selectedConversation.userName}
        />
      )}
    </div>
  );
}
