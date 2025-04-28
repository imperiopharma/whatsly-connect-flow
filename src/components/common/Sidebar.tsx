
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  BarChart3,
  Settings,
  Users,
  Layers,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { 
      name: "Dashboard", 
      path: "/", 
      icon: <BarChart3 className="h-5 w-5" /> 
    },
    { 
      name: "Conversas", 
      path: "/chats", 
      icon: <MessageCircle className="h-5 w-5" /> 
    },
    { 
      name: "Contatos", 
      path: "/contacts", 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      name: "Automações", 
      path: "/automations", 
      icon: <Layers className="h-5 w-5" /> 
    },
    { 
      name: "Configurações", 
      path: "/settings", 
      icon: <Settings className="h-5 w-5" /> 
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-200 ease-in-out lg:relative lg:transform-none shadow-md",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 border-b border-sidebar-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-whatsly-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">W</span>
            </div>
            <span className="text-sidebar-foreground font-semibold text-lg">Whatsly</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-sidebar-foreground lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="py-6 px-3 space-y-1 h-[calc(100vh-64px)] flex flex-col">
          <nav className="flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 py-2 px-3 rounded-md transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )
                }
                end={item.path === "/"}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto px-3 pb-4">
            <div className="bg-sidebar-accent rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sidebar-foreground font-medium">Status</span>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-whatsapp rounded-full animate-pulse mr-2"></span>
                  <span className="text-xs text-sidebar-foreground/80">Online</span>
                </div>
              </div>
              <div className="text-xs text-sidebar-foreground/70 mb-4">
                Conectado ao WhatsApp com o número:
                <div className="text-sm text-sidebar-foreground mt-1">+55 (11) 98765-4321</div>
              </div>
              <NavLink to="/settings" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full bg-sidebar-background border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/80"
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  Gerenciar Conexão
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
