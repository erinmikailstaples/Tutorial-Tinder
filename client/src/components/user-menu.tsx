import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, User, Github, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function UserMenu() {
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    githubUser,
    isGitHubConnected,
    login, 
    logout, 
    connectGitHub, 
    disconnectGitHub 
  } = useAuth();

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled data-testid="button-user-loading">
        <User className="h-5 w-5" />
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button 
        variant="default" 
        onClick={login}
        className="gap-2"
        data-testid="button-login"
      >
        <LogIn className="h-4 w-4" />
        Log In
      </Button>
    );
  }

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          data-testid="button-user-menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.email || 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <div className="font-medium">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : 'Account'}
            </div>
            <div className="text-sm text-muted-foreground font-normal">
              {user?.email}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-2">
          <div className="text-sm font-medium mb-2">GitHub Connection</div>
          {isGitHubConnected ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={githubUser?.avatar_url} alt={githubUser?.login || 'GitHub'} />
                  <AvatarFallback>
                    <Github className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {githubUser?.name || githubUser?.login}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    @{githubUser?.login}
                  </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => disconnectGitHub()}
                data-testid="button-disconnect-github"
              >
                <XCircle className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={connectGitHub}
              data-testid="button-connect-github-menu"
            >
              <Github className="h-4 w-4" />
              Connect GitHub
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
