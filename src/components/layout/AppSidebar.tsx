import { useState } from "react";
import { 
  Folder,
  FolderPlus,
  FileText,
  Search,
  Filter,
  CheckSquare,
  Archive,
  Settings,
  Home,
  Users,
  BarChart3
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTemplateStore } from "@/store/useTemplateStore";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "All Templates", url: "/templates", icon: FileText },
  { title: "Approvals", url: "/approvals", icon: CheckSquare },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Team", url: "/team", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { 
    folders, 
    selectedFolderId, 
    setSelectedFolderId, 
    pendingApprovalsCount,
    createFolder,
    templates
  } = useTemplateStore();
  
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  
  // Count templates per folder
  const getTemplateCount = (folderId: string) => {
    return templates.filter(t => t.folderId === folderId).length;
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim());
      setNewFolderName("");
      setIsCreatingFolder(false);
    }
  };

  return (
    <Sidebar className={cn("border-r border-border", collapsed ? "w-16" : "w-64")} collapsible="icon">
      <SidebarHeader className="p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Email Templates</h2>
              <p className="text-xs text-muted-foreground">Marketing Team</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
            <FileText className="h-4 w-4 text-white" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.title === "Approvals" && pendingApprovalsCount > 0 && (
                            <Badge variant="secondary" className="bg-warning text-warning-foreground">
                              {pendingApprovalsCount}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Folders */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              <span>Folders</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreatingFolder(true)}
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <FolderPlus className="h-3 w-3" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* All Templates */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => setSelectedFolderId(null)}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors text-left",
                        selectedFolderId === null
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4" />
                        <span>All Templates</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {templates.length}
                      </Badge>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Individual Folders */}
                {folders.map((folder) => (
                  <SidebarMenuItem key={folder.id}>
                    <SidebarMenuButton asChild>
                      <button
                        onClick={() => setSelectedFolderId(folder.id)}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors text-left",
                          selectedFolderId === folder.id
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: folder.color || '#8B5CF6' }}
                          />
                          <span className="truncate">{folder.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getTemplateCount(folder.id)}
                        </Badge>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* Create New Folder Input */}
                {isCreatingFolder && (
                  <SidebarMenuItem>
                    <div className="px-3 py-2">
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateFolder();
                          if (e.key === 'Escape') {
                            setIsCreatingFolder(false);
                            setNewFolderName("");
                          }
                        }}
                        onBlur={handleCreateFolder}
                        placeholder="Folder name"
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                    </div>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Quick Actions */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted w-full text-left">
                      <Search className="h-4 w-4" />
                      <span>Advanced Search</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted w-full text-left">
                      <Archive className="h-4 w-4" />
                      <span>Archived Templates</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted w-full text-left">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}