import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle, ExternalLink } from "lucide-react";

const EmailVerificationModal = ({ isOpen, onClose, email }) => {
  const handleOpenGmail = () => {
    window.open("https://gmail.com", "_blank");
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Mail className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-2xl font-bold">Email Verification Required</DialogTitle>
            <DialogDescription className="text-base">
              Please verify your email address before signing in to access your account.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Your email is not verified</p>
                <p className="text-muted-foreground mt-1">
                  We sent a verification link to <span className="font-semibold">{email}</span>. 
                  Please check your inbox and click the link to verify your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <Button
            onClick={handleOpenGmail}
            className="w-full sm:w-full bg-amber-600 hover:bg-amber-700 text-white font-medium h-11"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <span>Open Gmail</span>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-full h-11"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationModal;
