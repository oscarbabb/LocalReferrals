import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Loader2, MoreVertical, Trash2, Forward } from "lucide-react";
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

interface UserForForward {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

export default function MessagingModal({
  open,
  onOpenChange,
  currentUserId,
  recipientUserId,
  recipientName,
}: MessagingModalProps) {
  const [messageContent, setMessageContent] = useState("");
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [messageToForward, setMessageToForward] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const { toast } = useToast();
  const { t, dateLocale } = useLanguage();
  const queryClientInstance = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch conversation between current user and recipient
  // Poll every 3 seconds when modal is open to get real-time updates
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages/conversation", currentUserId, recipientUserId],
    enabled: !!currentUserId && !!recipientUserId && open,
    refetchInterval: open ? 3000 : false, // Poll every 3 seconds when open
  });

  // Fetch all users for forward modal
  const { data: allUsers = [], isLoading: isLoadingUsers } = useQuery<UserForForward[]>({
    queryKey: ["/api/users"],
    enabled: forwardModalOpen && !!currentUserId,
  });

  // Filter users based on search query
  const filteredUsers = allUsers.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mark messages as read when modal is open and messages are loaded
  useEffect(() => {
    if (!messages || !currentUserId || !open) return;
    
    // Find unread messages sent to the current user
    const unreadMessages = messages.filter(
      msg => msg.receiverId === currentUserId && !msg.isRead
    );
    
    // Mark each unread message as read
    unreadMessages.forEach(async (msg) => {
      try {
        await apiRequest("PATCH", `/api/messages/${msg.id}/mark-read`, {});
      } catch (error) {
        console.error("Failed to mark message as read:", error);
      }
    });
    
    // Invalidate unread count query to refresh badge
    if (unreadMessages.length > 0) {
      queryClientInstance.invalidateQueries({ 
        queryKey: [`/api/messages/user/${currentUserId}/unread-count`] 
      });
    }
  }, [messages, currentUserId, open, queryClientInstance]);

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
      queryClientInstance.invalidateQueries({ 
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

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest("DELETE", `/api/messages/${messageId}`, {});
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t('messages.delete.success'),
        description: t('messages.delete.successDescription'),
      });
      
      // Invalidate conversation query to refetch messages
      queryClientInstance.invalidateQueries({ 
        queryKey: ["/api/messages/conversation", currentUserId, recipientUserId] 
      });
      
      setMessageToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('messages.delete.error'),
        description: error.message || t('messages.delete.errorDescription'),
        variant: "destructive",
      });
    },
  });

  // Forward message mutation
  const forwardMessageMutation = useMutation({
    mutationFn: async ({ messageId, receiverId }: { messageId: string; receiverId: string }) => {
      const response = await apiRequest("POST", "/api/messages/forward", {
        messageId,
        receiverId,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t('messages.forward.success'),
        description: t('messages.forward.successDescription'),
      });
      
      // Invalidate conversation query to refetch messages
      queryClientInstance.invalidateQueries({ 
        queryKey: ["/api/messages/conversation", currentUserId, recipientUserId] 
      });
      
      setForwardModalOpen(false);
      setMessageToForward(null);
      setSelectedRecipient(null);
      setSearchQuery("");
    },
    onError: (error: Error) => {
      toast({
        title: t('messages.forward.error'),
        description: error.message || t('messages.forward.errorDescription'),
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

  const handleDeleteMessage = (messageId: string) => {
    setMessageToDelete(messageId);
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      deleteMessageMutation.mutate(messageToDelete);
    }
  };

  const handleForwardMessage = (message: Message) => {
    setMessageToForward(message);
    setForwardModalOpen(true);
  };

  const confirmForward = () => {
    if (messageToForward && selectedRecipient) {
      forwardMessageMutation.mutate({
        messageId: messageToForward.id,
        receiverId: selectedRecipient,
      });
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
    <>
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
                      <div className="flex items-start gap-2 max-w-[70%]">
                        <div
                          className={`rounded-lg px-4 py-2 ${
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
                        
                        {/* Only show actions for own messages */}
                        {isOwnMessage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                data-testid={`button-message-actions-${message.id}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleForwardMessage(message)}
                                className="cursor-pointer"
                                data-testid={`button-forward-${message.id}`}
                              >
                                <Forward className="mr-2 h-4 w-4" />
                                {t('messages.actions.forward')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteMessage(message.id)}
                                className="cursor-pointer text-red-600"
                                data-testid={`button-delete-${message.id}`}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('messages.actions.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!messageToDelete} onOpenChange={() => setMessageToDelete(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('messages.actions.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('messages.actions.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              {t('messages.actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMessageMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMessageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t('messages.actions.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Forward Message Dialog */}
      <Dialog open={forwardModalOpen} onOpenChange={setForwardModalOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-forward-message">
          <DialogHeader>
            <DialogTitle>{t('messages.forward.title')}</DialogTitle>
            <DialogDescription>
              {t('messages.forward.selectRecipient')}
            </DialogDescription>
          </DialogHeader>

          {/* Search Input */}
          <div className="py-4">
            <Input
              placeholder={t('messages.forward.searchUsers')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
              data-testid="input-search-users"
            />

            {/* Users List */}
            <ScrollArea className="h-[300px] border rounded-md">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-gray-500" data-testid="text-no-users">
                    {t('messages.forward.noUsers')}
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedRecipient(user.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                        selectedRecipient === user.id ? "bg-orange-50 border-2 border-orange-600" : ""
                      }`}
                      data-testid={`button-select-user-${user.id}`}
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Forward Button */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setForwardModalOpen(false);
                setMessageToForward(null);
                setSelectedRecipient(null);
                setSearchQuery("");
              }}
              data-testid="button-cancel-forward"
            >
              {t('messages.actions.cancel')}
            </Button>
            <Button
              onClick={confirmForward}
              disabled={!selectedRecipient || forwardMessageMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
              data-testid="button-confirm-forward"
            >
              {forwardMessageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Forward className="w-4 h-4 mr-2" />
              )}
              {t('messages.forward.send')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
