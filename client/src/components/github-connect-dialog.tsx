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
import { SiGithub } from "react-icons/si";

interface GitHubConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GitHubConnectDialog({ open, onOpenChange }: GitHubConnectDialogProps) {
  const handleConnect = () => {
    // Open Replit's GitHub connection page in a new tab
    window.open("https://replit.com/~/cli/connect/github", "_blank");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <SiGithub className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle>Connect Your GitHub Account</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base pt-4">
            To generate Replit-ready templates, you need to connect your GitHub account.
            Templates will be created in your personal GitHub account.
            
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">What you'll be able to do:</p>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Generate Replit-ready templates from any repository</li>
                <li>Templates are created in your own GitHub account</li>
                <li>One-click launch into Replit</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-github-connect">
            Maybe Later
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConnect}
            data-testid="button-connect-github"
            className="gap-2"
          >
            <SiGithub className="h-4 w-4" />
            Connect GitHub
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
