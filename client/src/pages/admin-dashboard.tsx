import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { MessageCircle, AlertCircle, Shield, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { parseSafeDate } from "@/lib/date-utils";
import { Link } from "wouter";

interface AdminMessage {
  id: string;
  userId: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  adminResponse: string | null;
  respondedBy: string | null;
  respondedAt: string | null;
  isReadByUser: boolean;
  isReadByAdmin: boolean;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    email: string;
    fullName: string;
  };
}

export default function AdminDashboard() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
  const [responseText, setResponseText] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const { data: messages, isLoading } = useQuery<AdminMessage[]>({
    queryKey: ["/api/admin-messages"],
  });

  // Mark admin messages as read when admin views them
  useEffect(() => {
    if (!messages) return;
    
    // Find unread messages
    const unreadMessages = messages.filter(msg => !msg.isReadByAdmin);
    
    // Mark each unread message as read
    unreadMessages.forEach(async (msg) => {
      try {
        await apiRequest("PATCH", `/api/admin-messages/${msg.id}/mark-read-admin`, {});
      } catch (error) {
        console.error("Failed to mark admin message as read:", error);
      }
    });
    
    // Invalidate unread count query to refresh badge
    if (unreadMessages.length > 0) {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/admin-messages/admin-unread-count`] 
      });
    }
  }, [messages]);

  const respondMutation = useMutation({
    mutationFn: async (data: { id: string; adminResponse?: string; status: string }) => {
      const payload: { status: string; adminResponse?: string } = { status: data.status };
      if (data.adminResponse) {
        payload.adminResponse = data.adminResponse;
      }
      return apiRequest("PATCH", `/api/admin-messages/${data.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin-messages"] });
      toast({
        title: t("admin.response.success"),
        description: t("admin.response.successDesc"),
      });
      setSelectedMessage(null);
      setResponseText("");
      setNewStatus("");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: t("admin.response.error"),
        description: t("admin.response.errorDesc"),
      });
    },
  });

  const filteredMessages = messages?.filter(msg => {
    if (categoryFilter !== "all" && msg.category !== categoryFilter) return false;
    if (statusFilter !== "all" && msg.status !== statusFilter) return false;
    if (priorityFilter !== "all" && msg.priority !== priorityFilter) return false;
    return true;
  }) || [];

  const handleRespond = (message: AdminMessage) => {
    setSelectedMessage(message);
    setResponseText(message.adminResponse || "");
    setNewStatus(message.status);
  };

  const handleSubmitResponse = () => {
    if (!selectedMessage) return;
    
    // Allow status-only updates or response updates
    const hasChanges = responseText.trim() || (newStatus && newStatus !== selectedMessage.status);
    if (!hasChanges) return;
    
    const updateData: { id: string; adminResponse?: string; status: string } = {
      id: selectedMessage.id,
      status: newStatus || selectedMessage.status,
    };
    
    // Only include adminResponse if there's new text
    if (responseText.trim()) {
      updateData.adminResponse = responseText.trim();
    }
    
    respondMutation.mutate(updateData);
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      lost_and_found: t("admin.category.lostAndFound"),
      question: t("admin.category.question"),
      complaint: t("admin.category.complaint"),
      suggestion: t("admin.category.suggestion"),
      general: t("admin.category.general"),
    };
    return categoryMap[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      open: t("admin.status.open"),
      in_progress: t("admin.status.inProgress"),
      resolved: t("admin.status.resolved"),
      closed: t("admin.status.closed"),
    };
    return statusMap[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const priorityMap: Record<string, string> = {
      low: t("admin.priority.low"),
      medium: t("admin.priority.medium"),
      high: t("admin.priority.high"),
      urgent: t("admin.priority.urgent"),
    };
    return priorityMap[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colorMap[priority] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      open: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.backToHome")}
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold" data-testid="text-admin-dashboard-title">
              {t("admin.dashboard.title")}
            </h1>
          </div>
          <p className="text-muted-foreground" data-testid="text-admin-dashboard-subtitle">
            {t("admin.dashboard.subtitle")}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="select-category-filter">
              <SelectValue placeholder={t("admin.dashboard.filterByCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.dashboard.all")}</SelectItem>
              <SelectItem value="lost_and_found">{t("admin.category.lostAndFound")}</SelectItem>
              <SelectItem value="question">{t("admin.category.question")}</SelectItem>
              <SelectItem value="complaint">{t("admin.category.complaint")}</SelectItem>
              <SelectItem value="suggestion">{t("admin.category.suggestion")}</SelectItem>
              <SelectItem value="general">{t("admin.category.general")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="select-status-filter">
              <SelectValue placeholder={t("admin.dashboard.filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.dashboard.all")}</SelectItem>
              <SelectItem value="open">{t("admin.status.open")}</SelectItem>
              <SelectItem value="in_progress">{t("admin.status.inProgress")}</SelectItem>
              <SelectItem value="resolved">{t("admin.status.resolved")}</SelectItem>
              <SelectItem value="closed">{t("admin.status.closed")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="select-priority-filter">
              <SelectValue placeholder={t("admin.dashboard.filterByPriority")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.dashboard.all")}</SelectItem>
              <SelectItem value="low">{t("admin.priority.low")}</SelectItem>
              <SelectItem value="medium">{t("admin.priority.medium")}</SelectItem>
              <SelectItem value="high">{t("admin.priority.high")}</SelectItem>
              <SelectItem value="urgent">{t("admin.priority.urgent")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2" data-testid="text-no-messages">
                {t("admin.dashboard.noMessages")}
              </h3>
              <p className="text-muted-foreground text-center">
                {t("admin.dashboard.noMessagesDesc")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <Card key={message.id} className="hover:shadow-md transition-shadow" data-testid={`card-message-${message.id}`}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2" data-testid={`text-message-subject-${message.id}`}>
                        {message.subject}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap gap-2 items-center">
                        <span data-testid={`text-message-from-${message.id}`}>
                          {t("admin.dashboard.from")}: {message.user?.fullName || message.user?.username || message.userId}
                        </span>
                        {message.user?.email && (
                          <span className="text-xs" data-testid={`text-message-email-${message.id}`}>
                            ({message.user.email})
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getPriorityColor(message.priority)} data-testid={`badge-priority-${message.id}`}>
                        {getPriorityLabel(message.priority)}
                      </Badge>
                      <Badge className={getStatusColor(message.status)} data-testid={`badge-status-${message.id}`}>
                        {getStatusLabel(message.status)}
                      </Badge>
                      <Badge variant="outline" data-testid={`badge-category-${message.id}`}>
                        {getCategoryLabel(message.category)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 line-clamp-3" data-testid={`text-message-content-${message.id}`}>
                    {message.message}
                  </p>
                  
                  {message.adminResponse && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {t("admin.detail.adminResponse")}
                      </p>
                      <p className="text-sm text-gray-700" data-testid={`text-admin-response-${message.id}`}>
                        {message.adminResponse}
                      </p>
                      {message.respondedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          {format(parseSafeDate(message.respondedAt), "PPp", { 
                            locale: language === "es" ? es : enUS 
                          })}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                      {format(parseSafeDate(message.createdAt), "PPp", { 
                        locale: language === "es" ? es : enUS 
                      })}
                    </p>
                    <Button 
                      onClick={() => handleRespond(message)}
                      variant={message.adminResponse ? "outline" : "default"}
                      size="sm"
                      data-testid={`button-respond-${message.id}`}
                    >
                      {message.adminResponse ? t("admin.dashboard.viewDetails") : t("admin.dashboard.respond")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-admin-response">
          <DialogHeader>
            <DialogTitle data-testid="text-response-dialog-title">{t("admin.response.title")}</DialogTitle>
            <DialogDescription>
              {selectedMessage?.subject}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{t("admin.form.message")}</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded" data-testid="text-original-message">
                {selectedMessage?.message}
              </p>
            </div>

            <div>
              <Label htmlFor="response" data-testid="label-admin-response">
                {t("admin.response.yourResponse")}
              </Label>
              <Textarea
                id="response"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder={t("admin.response.responsePlaceholder")}
                className="min-h-[120px] mt-2"
                data-testid="textarea-admin-response"
              />
            </div>

            <div>
              <Label htmlFor="status" data-testid="label-status">
                {t("admin.response.updateStatus")}
              </Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="mt-2" data-testid="select-new-status">
                  <SelectValue placeholder={t("admin.response.statusPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">{t("admin.status.open")}</SelectItem>
                  <SelectItem value="in_progress">{t("admin.status.inProgress")}</SelectItem>
                  <SelectItem value="resolved">{t("admin.status.resolved")}</SelectItem>
                  <SelectItem value="closed">{t("admin.status.closed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedMessage(null)}
              data-testid="button-cancel-response"
            >
              {t("admin.response.cancel")}
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={(!responseText.trim() && (!newStatus || newStatus === selectedMessage?.status)) || respondMutation.isPending}
              data-testid="button-submit-response"
            >
              {respondMutation.isPending ? t("common.loading") : t("admin.response.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
