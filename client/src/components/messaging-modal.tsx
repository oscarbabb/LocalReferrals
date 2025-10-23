import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { Message } from "@shared/schema";
import { format } from "date-fns";
import { parseSafeDate } from "@/lib/date-utils";

interface MessagingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string | undefined;
  recipientUserId: string;
  recipientName: string;
}

export default function MessagingModal({
  open,
  onOpenChange,
  currentUserId,
  recipientUserId,
  recipientName,
}: MessagingModalProps) {
  const [messageContent, setMessageContent] = useState("");
  const { toast } = useToast();
  const { t, dateLocale } = useLanguage();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch conversation between current user and recipient
  // Poll every 3 seconds when modal is open to get real-time updates
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages/conversation", currentUserId, recipientUserId],
    enabled: !!currentUserId && !!recipientUserId && open,
    refetchInterval: open ? 3000 : false, // Poll every 3 seconds when open
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUserId) {
        throw new Error("Usuario no autenticado");
      }
      
      const response = await apiRequest("POST", "/api/messages", {
        senderId: currentUserId,
        receiverId: recipientUserId,
        content,
      });
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t('messages.toast.sent'),
        description: t('messages.toast.sentSuccess'),
      });
      
      // Clear input
      setMessageContent("");
      
      // Invalidate conversation query to refetch messages
      queryClient.invalidateQueries({ 
        queryKey: ["/api/messages/conversation", currentUserId, recipientUserId] 
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('messages.toast.error'),
        description: error.message || t('messages.toast.tryAgain'),
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    const trimmedContent = messageContent.trim();
    
    if (!trimmedContent) {
      toast({
        title: t('messages.toast.emptyMessage'),
        description: t('messages.toast.writeMessage'),
        variant: "destructive",
      });
      return;
    }
    
    if (!currentUserId) {
      toast({
        title: t('messages.modal.authRequired'),
        description: t('messages.modal.authMessage'),
        variant: "destructive",
      });
      return;
    }
    
    sendMessageMutation.mutate(trimmedContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // If user is not authenticated, show login prompt
  if (!currentUserId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-messaging-unauthenticated">
          <DialogHeader>
            <DialogTitle>{t('messages.modal.authRequired')}</DialogTitle>
            <DialogDescription>
              {t('messages.modal.authMessage')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">
              {t('messages.modal.authMessage')}
            </p>
            <Button
              onClick={() => {
                onOpenChange(false);
                window.location.href = "/auth";
              }}
              className="bg-orange-600 hover:bg-orange-700"
              data-testid="button-login-to-message"
            >
              {t('messages.modal.loginBtn')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col" data-testid="dialog-messaging">
        <DialogHeader>
          <DialogTitle data-testid="text-messaging-title">
            Conversación con {recipientName}
          </DialogTitle>
          <DialogDescription>
            Envía un mensaje directo a {recipientName}
          </DialogDescription>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea 
          className="flex-1 pr-4 -mr-4" 
          ref={scrollRef}
          data-testid="scroll-messages"
        >
          {isLoadingMessages ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid="text-empty-conversation">
                {t('messages.modal.noMessages')}
              </h3>
              <p className="text-gray-500">
                {t('messages.modal.startConversation')}
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === currentUserId;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${message.id}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? "bg-orange-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm" data-testid={`text-message-content-${message.id}`}>
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? "text-orange-100" : "text-gray-500"
                        }`}
                        data-testid={`text-message-time-${message.id}`}
                      >
                        {format(parseSafeDate(message.createdAt), "PPp", { locale: dateLocale })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="flex gap-2 pt-4 border-t">
          <Textarea
            placeholder={t('messages.modal.typeMessage')}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 min-h-[80px] resize-none"
            disabled={sendMessageMutation.isPending}
            data-testid="input-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending || !messageContent.trim()}
            className="bg-orange-600 hover:bg-orange-700 self-end"
            data-testid="button-send-message"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                {t('messages.modal.send')}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
