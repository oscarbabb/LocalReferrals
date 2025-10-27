import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, MessageCircle, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import type { AdminMessage } from "@shared/schema";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { parseSafeDate } from "@/lib/date-utils";

export default function ContactAdmin() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");

  const { data: user } = useQuery<{ id: string }>({
    queryKey: ["/api/auth/user"],
  });

  const { data: messages = [] } = useQuery<AdminMessage[]>({
    queryKey: ["/api/admin-messages/user", user?.id],
    enabled: !!user?.id,
  });

  // Mark admin messages as read when user views them
  useEffect(() => {
    if (!messages || !user?.id) return;
    
    // Find unread messages
    const unreadMessages = messages.filter(msg => !msg.isReadByUser);
    
    // Mark each unread message as read
    unreadMessages.forEach(async (msg) => {
      try {
        await apiRequest("PATCH", `/api/admin-messages/${msg.id}/mark-read-user`, {});
      } catch (error) {
        console.error("Failed to mark admin message as read:", error);
      }
    });
    
    // Invalidate unread count query to refresh badge
    if (unreadMessages.length > 0) {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/admin-messages/user/${user.id}/unread-count`] 
      });
    }
  }, [messages, user?.id]);

  const createMessageMutation = useMutation({
    mutationFn: async (data: {
      category: string;
      subject: string;
      message: string;
      priority?: string;
    }) => {
      console.log("🔵 Creating admin message with data:", data);
      const response = await apiRequest("POST", `/api/admin-messages`, data);
      const result = await response.json();
      console.log("✅ Admin message created:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin-messages/user", user?.id] });
      toast({
        title: t("admin.toast.success"),
        description: t("admin.toast.successDesc"),
      });
      setShowForm(false);
      setCategory("");
      setSubject("");
      setMessage("");
      setPriority("medium");
    },
    onError: (error: any) => {
      console.error("❌ Error creating admin message:", error);
      toast({
        title: t("admin.toast.error"),
        description: error.message || t("admin.toast.errorDesc"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Form submitted with:", { category, subject, message, priority });
    
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Inicia sesión requerido",
        description: "Debes iniciar sesión para enviar un mensaje al administrador.",
        variant: "destructive",
      });
      return;
    }
    
    if (!category || !subject || !message) {
      console.warn("⚠️ Form validation failed - missing required fields");
      return;
    }

    console.log("🚀 Triggering mutation...");
    createMessageMutation.mutate({
      category,
      subject,
      message,
      priority,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "default",
      in_progress: "secondary",
      resolved: "outline",
      closed: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {t(`admin.status.${status === "in_progress" ? "inProgress" : status}`)}
      </Badge>
    );
  };

  const getCategoryLabel = (cat: string) => {
    const categoryMap: Record<string, string> = {
      lost_and_found: "lostAndFound",
      question: "question",
      complaint: "complaint",
      suggestion: "suggestion",
      general: "general",
    };
    return t(`admin.category.${categoryMap[cat] || "general"}`);
  };

  const getPriorityLabel = (pri: string) => {
    return t(`admin.priority.${pri || "medium"}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("admin.backToMessages")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">
            {t("admin.pageTitle")}
          </h1>
          <p className="text-gray-600 mt-2" data-testid="text-page-subtitle">
            {t("admin.pageSubtitle")}
          </p>
        </div>

        {!user ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("admin.loginRequired")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t("admin.loginRequiredDesc")}
                </p>
                <Link href="/auth">
                  <Button className="bg-accent hover:bg-accent/90" data-testid="button-login">
                    {t("admin.loginButton")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : !showForm ? (
          <Button 
            onClick={() => setShowForm(true)} 
            className="mb-6 bg-accent hover:bg-accent/90"
            data-testid="button-new-message"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("admin.contactButton")}
          </Button>
        ) : null}

        {showForm && (
          <Card className="mb-6" data-testid="card-message-form">
            <CardHeader>
              <CardTitle>{t("admin.contactButton")}</CardTitle>
              <CardDescription>{t("admin.pageSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" data-testid="label-category">
                    {t("admin.form.category")}
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder={t("admin.form.categoryPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lost_and_found" data-testid="option-lost-found">{t("admin.category.lostAndFound")}</SelectItem>
                      <SelectItem value="question" data-testid="option-question">{t("admin.category.question")}</SelectItem>
                      <SelectItem value="complaint" data-testid="option-complaint">{t("admin.category.complaint")}</SelectItem>
                      <SelectItem value="suggestion" data-testid="option-suggestion">{t("admin.category.suggestion")}</SelectItem>
                      <SelectItem value="general" data-testid="option-general">{t("admin.category.general")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" data-testid="label-priority">
                    {t("admin.form.priority")}
                  </label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger data-testid="select-priority">
                      <SelectValue placeholder={t("admin.form.priorityPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low" data-testid="option-low">{t("admin.priority.low")}</SelectItem>
                      <SelectItem value="medium" data-testid="option-medium">{t("admin.priority.medium")}</SelectItem>
                      <SelectItem value="high" data-testid="option-high">{t("admin.priority.high")}</SelectItem>
                      <SelectItem value="urgent" data-testid="option-urgent">{t("admin.priority.urgent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" data-testid="label-subject">
                    {t("admin.form.subject")}
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t("admin.form.subjectPlaceholder")}
                    required
                    data-testid="input-subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" data-testid="label-message">
                    {t("admin.form.message")}
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("admin.form.messagePlaceholder")}
                    rows={6}
                    required
                    data-testid="textarea-message"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    disabled={createMessageMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="button-submit"
                  >
                    {createMessageMutation.isPending ? t("common.loading") : t("admin.form.submit")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    data-testid="button-cancel"
                  >
                    {t("admin.form.cancel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900" data-testid="text-my-messages">
            {t("admin.myMessages")}
          </h2>

          {messages.length === 0 ? (
            <Card data-testid="card-no-messages">
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("admin.list.noMessages")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t("admin.list.noMessagesDesc")}
                </p>
                {!showForm && (
                  <Button onClick={() => setShowForm(true)} data-testid="button-send-first">
                    {t("admin.list.sendFirst")}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            messages.map((msg) => (
              <Card key={msg.id} data-testid={`card-message-${msg.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg" data-testid="text-message-subject">
                        {msg.subject}
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        {getStatusBadge(msg.status)}
                        <Badge variant="outline" data-testid="text-message-category">{getCategoryLabel(msg.category)}</Badge>
                        <Badge variant="outline" data-testid="text-message-priority">{getPriorityLabel(msg.priority || "medium")}</Badge>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500" data-testid="text-message-date">
                      {format(parseSafeDate(msg.createdAt), "PPP", {
                        locale: language === "es" ? es : enUS,
                      })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-gray-700 whitespace-pre-wrap" data-testid="text-message-content">
                      {msg.message}
                    </p>
                  </div>

                  {msg.adminResponse && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-testid="div-admin-response">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 mb-2" data-testid="text-response-title">
                            {t("admin.detail.adminResponse")}
                          </h4>
                          <p className="text-blue-800 whitespace-pre-wrap" data-testid="text-response-content">
                            {msg.adminResponse}
                          </p>
                          {msg.respondedAt && (
                            <p className="text-sm text-blue-600 mt-2" data-testid="text-response-date">
                              {t("admin.detail.respondedAt")}{" "}
                              {format(parseSafeDate(msg.respondedAt), "PPP", {
                                locale: language === "es" ? es : enUS,
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!msg.adminResponse && msg.status === "open" && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4" data-testid="div-no-response">
                      <p className="text-gray-600 text-sm" data-testid="text-waiting-response">
                        {t("admin.detail.noResponse")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
