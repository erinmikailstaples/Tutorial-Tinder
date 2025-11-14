import { Code2 } from "lucide-react";
import { Link } from "wouter";
import { UserMenu } from "@/components/user-menu";

interface DeckHeaderProps {
  current: number;
  total: number;
}

export function DeckHeader({ current, total }: DeckHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="h-16 px-6 flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 font-bold text-lg hover-elevate active-elevate-2 px-3 py-2 rounded-md"
          data-testid="link-home"
        >
          <Code2 className="h-6 w-6 text-primary" />
          <span>Tutorial Tinder</span>
        </Link>

        {/* Counter and User Menu */}
        <div className="flex items-center gap-4">
          {total > 0 && (
            <div className="text-sm text-muted-foreground font-medium" data-testid="text-counter">
              <span className="text-foreground font-semibold">{current}</span> of {total}
            </div>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
