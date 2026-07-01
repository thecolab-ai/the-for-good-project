import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PersonAvatar({ login, avatar, size = 28, className }: { login: string; avatar?: string; size?: number; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a href={`https://github.com/${login}`} target="_blank" rel="noreferrer" className={cn("inline-block", className)}>
          <Avatar style={{ height: size, width: size }} className="border border-border">
            {avatar ? <AvatarImage src={avatar} alt={login} /> : null}
            <AvatarFallback>{initials(login)}</AvatarFallback>
          </Avatar>
        </a>
      </TooltipTrigger>
      <TooltipContent>@{login}</TooltipContent>
    </Tooltip>
  );
}
