import { ArrowLeft, ArrowRight, CornerDownLeft } from "lucide-react";

export function KeyboardShortcuts() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-card/95 backdrop-blur-md border border-card-border rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Skip</span>
          </div>
          
          <div className="w-px h-4 bg-border"></div>
          
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            <span>Save</span>
          </div>
          
          <div className="w-px h-4 bg-border"></div>
          
          <div className="flex items-center gap-2">
            <CornerDownLeft className="h-4 w-4" />
            <span>Launch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
