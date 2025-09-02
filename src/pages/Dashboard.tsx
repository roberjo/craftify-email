import React from 'react';
import { 
  FileText, 
  Users, 
  CheckSquare, 
  TrendingUp, 
  Clock,
  Archive,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTemplateStore } from "@/store/useTemplateStore";
import { StatusBadge } from "@/components/ui/status-badge";

export default function Dashboard() {
  const { 
    templates, 
    folders, 
    pendingApprovalsCount,
    currentUser,
    setEditorOpen
  } = useTemplateStore();

  const stats = {
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.enabled).length,
    draftTemplates: templates.filter(t => t.status === 'draft').length,
    approvedTemplates: templates.filter(t => t.status === 'approved').length,
    pendingApprovals: pendingApprovalsCount,
    totalFolders: folders.length,
  };

  const recentTemplates = templates
    .sort((a, b) => b.lastModifiedAt.getTime() - a.lastModifiedAt.getTime())
    .slice(0, 5);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {currentUser?.name}! Here's what's happening with your templates.
          </p>
        </div>
        <Button 
          onClick={() => setEditorOpen(true, 'create')}
          className="bg-gradient-primary hover:bg-primary-hover shadow-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Total Templates
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats.totalTemplates}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {stats.activeTemplates} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
              Approved
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats.approvedTemplates}
            </div>
            <div className="mt-2">
              <Progress 
                value={(stats.approvedTemplates / stats.totalTemplates) * 100} 
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {stats.pendingApprovals}
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Needs your attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Folders
            </CardTitle>
            <Archive className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats.totalFolders}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              Organized collections
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Templates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Templates</span>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTemplates.length > 0 ? (
                recentTemplates.map((template) => (
                  <div 
                    key={template.id} 
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-foreground truncate">
                          {template.name}
                        </h4>
                        <StatusBadge status={template.status} />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {template.subject}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground ml-4">
                      <div>{formatDate(template.lastModifiedAt)}</div>
                      <div>by {template.lastModifiedBy}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No templates yet. Create your first template to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start bg-gradient-primary hover:bg-primary-hover text-white"
                onClick={() => setEditorOpen(true, 'create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Team
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>System Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.pendingApprovals > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <Clock className="h-4 w-4 text-warning mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-warning">
                        {stats.pendingApprovals} template{stats.pendingApprovals > 1 ? 's' : ''} pending approval
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Review pending templates to keep workflows moving
                      </p>
                    </div>
                  </div>
                )}

                {stats.draftTemplates > 5 && (
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {stats.draftTemplates} drafts need attention
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Consider reviewing and finalizing draft templates
                      </p>
                    </div>
                  </div>
                )}

                {stats.pendingApprovals === 0 && stats.draftTemplates <= 5 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All caught up! 🎉
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Folders Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Folders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {folders.slice(0, 4).map((folder) => (
                  <div key={folder.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: folder.color || '#8B5CF6' }}
                      />
                      <span className="text-sm font-medium">{folder.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {templates.filter(t => t.folderId === folder.id).length}
                    </Badge>
                  </div>
                ))}
                {folders.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{folders.length - 4} more folders
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}