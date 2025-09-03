import React from 'react';
import { Search, Plus, Bell, Settings, User, LogOut } from 'lucide-react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTemplateStore } from "@/store/useTemplateStore";

export function TopBar() {
  const { 
    currentUser, 
    searchQuery, 
    setSearchQuery, 
    pendingApprovalsCount,
    setEditorOpen 
  } = useTemplateStore();

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="h-8 w-8" />
          
          {/* Search */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates, folders, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Create New Template Button */}
          <Button 
            onClick={() => setEditorOpen(true, 'create')}
            className="bg-gradient-primary hover:bg-primary-hover text-white shadow-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {pendingApprovalsCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-warning text-warning-foreground"
                  >
                    {pendingApprovalsCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {pendingApprovalsCount > 0 ? (
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {pendingApprovalsCount} template{pendingApprovalsCount > 1 ? 's' : ''} pending approval
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Review and approve templates submitted by your team
                    </p>
                  </div>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem>
                  <p className="text-sm text-muted-foreground">No new notifications</p>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                  <AvatarFallback>
                    {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser?.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {currentUser?.domain}
                    </Badge>
                    {currentUser?.permissions.canApprove && (
                      <Badge variant="secondary" className="text-xs">
                        Approver
                      </Badge>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}