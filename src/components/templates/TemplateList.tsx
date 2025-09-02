import React from 'react';
import { 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Archive, 
  Trash2, 
  Eye,
  Send,
  Calendar,
  User,
  Grid3X3,
  List,
  Filter
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTemplateStore } from "@/store/useTemplateStore";
import { EmailTemplate } from "@/types";
import { cn } from "@/lib/utils";

interface TemplateListProps {
  className?: string;
}

export function TemplateList({ className }: TemplateListProps) {
  const {
    getFilteredTemplates,
    selectedTemplateIds,
    toggleTemplateSelection,
    viewMode,
    setViewMode,
    setSelectedTemplate,
    setEditorOpen,
    duplicateTemplate,
    deleteTemplate,
    requestApproval,
    currentUser
  } = useTemplateStore();

  const templates = getFilteredTemplates();

  const handleTemplateAction = async (template: EmailTemplate, action: string) => {
    switch (action) {
      case 'edit':
        setSelectedTemplate(template);
        setEditorOpen(true, 'edit');
        break;
      case 'view':
        setSelectedTemplate(template);
        setEditorOpen(true, 'view');
        break;
      case 'duplicate':
        await duplicateTemplate(template.id);
        break;
      case 'delete':
        await deleteTemplate(template.id);
        break;
      case 'request-approval':
        await requestApproval(template.id);
        break;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const canEdit = (template: EmailTemplate) => {
    return currentUser?.permissions.canEdit && 
           (template.createdBy === currentUser.id || currentUser.permissions.canApprove);
  };

  const canDelete = (template: EmailTemplate) => {
    return currentUser?.permissions.canDelete && 
           (template.createdBy === currentUser.id || currentUser.permissions.canApprove);
  };

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <Grid3X3 className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No templates found</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Get started by creating your first email template or adjust your search filters.
        </p>
        <Button onClick={() => setEditorOpen(true, 'create')} className="bg-gradient-primary">
          Create Your First Template
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-foreground">
            Templates ({templates.length})
          </h2>
          {selectedTemplateIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {selectedTemplateIds.length} selected
              </Badge>
              <Button variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <div className="flex items-center border border-border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Template Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className={cn(
                "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/10",
                selectedTemplateIds.includes(template.id) && "ring-2 ring-primary"
              )}
            >
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedTemplateIds.includes(template.id)}
                      onCheckedChange={() => toggleTemplateSelection(template.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <StatusBadge status={template.status} />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleTemplateAction(template, 'view')}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      {canEdit(template) && (
                        <DropdownMenuItem onClick={() => handleTemplateAction(template, 'edit')}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleTemplateAction(template, 'duplicate')}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      {template.status === 'draft' && (
                        <DropdownMenuItem onClick={() => handleTemplateAction(template, 'request-approval')}>
                          <Send className="mr-2 h-4 w-4" />
                          Request Approval
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleTemplateAction(template, 'archive')}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                      {canDelete(template) && (
                        <DropdownMenuItem 
                          onClick={() => handleTemplateAction(template, 'delete')}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-0" onClick={() => handleTemplateAction(template, 'view')}>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {template.subject}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{template.createdBy}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(template.lastModifiedAt)}</span>
                    </div>
                  </div>
                  
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className={cn(
                "group cursor-pointer transition-all duration-200 hover:shadow-md",
                selectedTemplateIds.includes(template.id) && "ring-2 ring-primary"
              )}
            >
              <CardContent className="p-4" onClick={() => handleTemplateAction(template, 'view')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <Checkbox
                      checked={selectedTemplateIds.includes(template.id)}
                      onCheckedChange={() => toggleTemplateSelection(template.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {template.name}
                        </h3>
                        <StatusBadge status={template.status} />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {template.subject}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="text-right">
                      <div>{template.createdBy}</div>
                      <div className="text-xs">{formatDate(template.lastModifiedAt)}</div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleTemplateAction(template, 'view')}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        {canEdit(template) && (
                          <DropdownMenuItem onClick={() => handleTemplateAction(template, 'edit')}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleTemplateAction(template, 'duplicate')}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        {template.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleTemplateAction(template, 'request-approval')}>
                            <Send className="mr-2 h-4 w-4" />
                            Request Approval
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleTemplateAction(template, 'archive')}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        {canDelete(template) && (
                          <DropdownMenuItem 
                            onClick={() => handleTemplateAction(template, 'delete')}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}