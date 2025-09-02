import React from 'react';
import { 
  CheckSquare, 
  X, 
  Eye, 
  Clock, 
  User, 
  Calendar,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTemplateStore } from "@/store/useTemplateStore";
import { useState } from 'react';

export default function Approvals() {
  const { 
    approvalRequests, 
    templates,
    approveTemplate,
    rejectTemplate,
    setSelectedTemplate,
    setEditorOpen,
    currentUser
  } = useTemplateStore();

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [comments, setComments] = useState('');

  const pendingRequests = approvalRequests.filter(req => req.status === 'pending');
  const completedRequests = approvalRequests.filter(req => req.status !== 'pending');

  const handleApprove = async (requestId: string, templateId: string) => {
    await approveTemplate(templateId, comments);
    setComments('');
    setSelectedRequestId(null);
  };

  const handleReject = async (requestId: string, templateId: string) => {
    if (!comments.trim()) return;
    await rejectTemplate(templateId, comments);
    setComments('');
    setSelectedRequestId(null);
  };

  const getTemplate = (templateId: string) => {
    return templates.find(t => t.id === templateId);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const canApprove = currentUser?.permissions.canApprove;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve template changes submitted by your team.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting your review</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedRequests.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedRequests.filter(r => r.status === 'rejected').length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Pending Approvals</h2>
          {!canApprove && (
            <Badge variant="outline" className="text-warning">
              <AlertCircle className="h-3 w-3 mr-1" />
              View Only
            </Badge>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">All caught up!</h3>
              <p className="text-muted-foreground">
                No templates are currently pending approval.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => {
              const template = getTemplate(request.templateId);
              if (!template) return null;

              const isSelected = selectedRequestId === request.id;

              return (
                <Card key={request.id} className="transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg">{template.name}</h3>
                          <StatusBadge status={template.status} />
                          <Badge variant="outline" className="text-xs">
                            Version {request.templateVersion}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{template.subject}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>Requested by {request.requestedBy}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(request.requestedAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setEditorOpen(true, 'view');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        {canApprove && (
                          <Button
                            variant={isSelected ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setSelectedRequestId(isSelected ? null : request.id)}
                          >
                            {isSelected ? 'Cancel' : 'Review'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Changes Summary</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.changes}
                        </p>
                      </div>

                      {isSelected && canApprove && (
                        <div className="border-t pt-4 space-y-4">
                          <div>
                            <Label htmlFor="comments">Comments (optional)</Label>
                            <Textarea
                              id="comments"
                              value={comments}
                              onChange={(e) => setComments(e.target.value)}
                              placeholder="Add feedback or comments for the submitter..."
                              className="mt-2"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Button
                              onClick={() => handleApprove(request.id, request.templateId)}
                              className="bg-success hover:bg-success/90 text-success-foreground"
                            >
                              <CheckSquare className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleReject(request.id, request.templateId)}
                              disabled={!comments.trim()}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {completedRequests.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          
          <div className="space-y-3">
            {completedRequests.slice(0, 10).map((request) => {
              const template = getTemplate(request.templateId);
              if (!template) return null;

              return (
                <Card key={request.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          request.status === 'approved' ? 'bg-success' : 'bg-destructive'
                        }`} />
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.status === 'approved' ? 'Approved' : 'Rejected'} by {request.approvedBy}
                            {request.approvedAt && ` on ${formatDate(request.approvedAt)}`}
                          </p>
                        </div>
                      </div>
                      
                      {request.comments && (
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <MessageCircle className="h-3 w-3" />
                          <span className="text-xs">Has feedback</span>
                        </div>
                      )}
                    </div>
                    
                    {request.comments && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground italic">
                          "{request.comments}"
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}