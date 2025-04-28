
import { Button } from "@/components/ui/button";
import { Bell, Menu, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="h-16 border-b flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-whatsly-600 flex items-center justify-center">
            <span className="text-white font-medium text-sm">W</span>
          </div>
          <span className="font-semibold text-lg hidden md:block">Whatsly</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-whatsapp rounded-full"></span>
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-whatsly-100 flex items-center justify-center">
          <span className="text-whatsly-800 font-medium text-sm">U</span>
        </div>
      </div>
    </div>
  );
}
