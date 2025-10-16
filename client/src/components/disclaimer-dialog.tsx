import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DisclaimerDialogProps {
  open: boolean;
  onAccept: () => void;
  userId: string;
}

export default function DisclaimerDialog({ open, onAccept, userId }: DisclaimerDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAccepting, setIsAccepting] = useState(false);

  const acceptDisclaimerMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/users/${userId}`, {
        disclaimerAccepted: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: t('common.success'),
        description: t('disclaimer.thanks'),
      });
      onAccept();
    },
    onError: (error) => {
      console.error("Error accepting disclaimer:", error);
      toast({
        title: t('common.error'),
        description: t('disclaimer.mustAccept'),
        variant: "destructive",
      });
    },
  });

  const handleAccept = async () => {
    setIsAccepting(true);
    await acceptDisclaimerMutation.mutateAsync();
    setIsAccepting(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]" data-testid="dialog-disclaimer">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            {t('disclaimer.title')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('disclaimer.title')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 text-gray-700">
            {/* Introduction */}
            <p className="text-base leading-relaxed">
              {t('disclaimer.intro')}
            </p>

            {/* Important Note */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <p className="font-semibold text-orange-900 mb-2">
                {t('disclaimer.importantNote')}
              </p>
              <p className="text-orange-800 leading-relaxed">
                {t('disclaimer.responsibility')}
              </p>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold text-lg mb-3 text-gray-900">
                {t('disclaimer.recommendationsTitle')}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{t('disclaimer.recommendation1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{t('disclaimer.recommendation2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{t('disclaimer.recommendation3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{t('disclaimer.recommendation4')}</span>
                </li>
              </ul>
            </div>

            {/* Closing */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-blue-900 mb-2">
                {t('disclaimer.closing')}
              </p>
              <p className="text-blue-800">
                {t('disclaimer.thanks')}
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6">
          <Button
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3"
            data-testid="button-accept-disclaimer"
          >
            {isAccepting ? t('common.loading') : t('disclaimer.acceptButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
