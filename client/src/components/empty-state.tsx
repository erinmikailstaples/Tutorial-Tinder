import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  onRestart: () => void;
}

export function EmptyState({ onRestart }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center max-w-md px-6">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-6 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
        </div>
        
        <h2 className="font-bold text-3xl mb-4">You've seen them all!</h2>
        
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Great job exploring all the tutorials. Check back later for new additions, 
          or restart to review your favorites.
        </p>

        <Button 
          size="lg"
          onClick={onRestart}
          className="px-8 hover-elevate active-elevate-2"
          data-testid="button-restart"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Start Over
        </Button>
      </div>
    </div>
  );
}
