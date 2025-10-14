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
import { UserPlus, MessageCircle, Mail, Link as LinkIcon, Check, Copy } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function InviteButton() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailMessageCopied, setEmailMessageCopied] = useState(false);

  // Get the current URL for sharing
  const shareUrl = window.location.origin;
  
  // Get localized invite message
  const inviteMessage = t('invite.messageBody');
  const inviteSubject = t('invite.emailSubject');
  
  // Full email message for copying
  const fullEmailMessage = `${inviteSubject}\n\n${inviteMessage}\n\n${shareUrl}`;

  const handleWhatsAppShare = () => {
    const message = `${inviteMessage}\n\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailShare = () => {
    setEmailDialogOpen(true);
  };

  const handleCopyEmailMessage = async () => {
    try {
      await navigator.clipboard.writeText(fullEmailMessage);
      setEmailMessageCopied(true);
      toast({
        title: t('invite.copied'),
        description: t('invite.emailCopied') || 'Email message copied! Paste it into your email.',
      });
      setTimeout(() => setEmailMessageCopied(false), 2000);
    } catch (err) {
      toast({
        title: t('common.error'),
        description: t('invite.copyError'),
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: t('invite.copied'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: t('common.error'),
        description: t('invite.copyError'),
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Main Invite Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            size="sm" 
            className="bg-accent hover:bg-accent/90 text-white gap-2 shadow-sm"
            data-testid="button-invite"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t('invite.button')}</span>
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

      {/* Email Message Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-lg" data-testid="dialog-email-message">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {t('invite.email')}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {t('invite.emailInstructions') || 'Copy this message and paste it into your email'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <Textarea
              value={fullEmailMessage}
              readOnly
              rows={8}
              className="font-mono text-sm resize-none"
              data-testid="textarea-email-message"
            />
            
            <Button
              onClick={handleCopyEmailMessage}
              className="w-full gap-2"
              data-testid="button-copy-email-message"
            >
              {emailMessageCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  {t('invite.copied')}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  {t('invite.copyMessage') || 'Copy Message'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
