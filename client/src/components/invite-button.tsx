import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, MessageCircle, Mail, Link as LinkIcon, Check } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";

export default function InviteButton() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Get the current URL for sharing
  const shareUrl = window.location.origin;
  
  // Get localized invite message
  const inviteMessage = t('invite.messageBody');
  const inviteSubject = t('invite.emailSubject');

  const handleWhatsAppShare = () => {
    const message = `${inviteMessage}\n\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailShare = () => {
    const subject = inviteSubject;
    const body = `${inviteMessage}\n\n${shareUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: t('invite.copied'),
        description: shareUrl,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: t('common.error'),
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          data-testid="button-invite"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">{t('invite.button')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="dialog-invite">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900" data-testid="text-invite-title">
            {t('invite.title')}
          </DialogTitle>
          <DialogDescription className="text-gray-600" data-testid="text-invite-description">
            {t('invite.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {/* WhatsApp Share */}
          <Button
            onClick={handleWhatsAppShare}
            className="w-full bg-green-500 hover:bg-green-600 text-white justify-start gap-3"
            data-testid="button-share-whatsapp"
          >
            <MessageCircle className="h-5 w-5" />
            {t('invite.whatsapp')}
          </Button>

          {/* Email Share */}
          <Button
            onClick={handleEmailShare}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white justify-start gap-3"
            data-testid="button-share-email"
          >
            <Mail className="h-5 w-5" />
            {t('invite.email')}
          </Button>

          {/* Copy Link */}
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full justify-start gap-3"
            data-testid="button-copy-link"
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <LinkIcon className="h-5 w-5" />
            )}
            {copied ? t('invite.copied') : t('invite.copyLink')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
