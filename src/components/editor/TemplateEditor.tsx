import React, { useState, useEffect } from 'react';
import { X, Save, Send, Eye, Code, Type, Smartphone, Monitor, Tablet, Mail, User } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTemplateStore } from "@/store/useTemplateStore";
import { EmailTemplate } from "@/types";
import { cn } from "@/lib/utils";

// React Quill configuration for email editing
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
  }
};

const quillFormats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet', 'indent',
  'align', 'blockquote', 'code-block',
  'link', 'image'
];

interface EmailRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

function EmailRichEditor({ value, onChange, placeholder, readOnly }: EmailRichEditorProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={quillModules}
        formats={quillFormats}
        style={{ height: '400px' }}
        className="quill-editor"
      />
    </div>
  );
}

interface TemplateEditorProps {
  open: boolean;
  onClose: () => void;
}

export function TemplateEditor({ open, onClose }: TemplateEditorProps) {
  const {
    selectedTemplate,
    editorMode,
    createTemplate,
    updateTemplate,
    requestApproval,
    currentUser,
    folders
  } = useTemplateStore();

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    htmlContent: '',
    plainTextContent: '',
    folderId: '',
    tags: [] as string[],
  });

  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('design');
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when template changes
  useEffect(() => {
    if (selectedTemplate && editorMode === 'edit') {
      setFormData({
        name: selectedTemplate.name,
        subject: selectedTemplate.subject,
        htmlContent: selectedTemplate.htmlContent,
        plainTextContent: selectedTemplate.plainTextContent,
        folderId: selectedTemplate.folderId || '',
        tags: selectedTemplate.tags || [],
      });
    } else if (editorMode === 'create') {
      setFormData({
        name: '',
        subject: '',
        htmlContent: '',
        plainTextContent: '',
        folderId: '',
        tags: [],
      });
    }
  }, [selectedTemplate, editorMode, open]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subject.trim()) return;

    setIsSaving(true);
    try {
      if (editorMode === 'create') {
        await createTemplate({
          domain: currentUser?.domain || 'default',
          folderId: formData.folderId || undefined,
          name: formData.name,
          subject: formData.subject,
          htmlContent: formData.htmlContent,
          plainTextContent: formData.plainTextContent,
          variables: extractVariables(formData.htmlContent + ' ' + formData.subject),
          status: 'draft',
          enabled: false,
          tags: formData.tags,
        });
      } else if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, {
          name: formData.name,
          subject: formData.subject,
          htmlContent: formData.htmlContent,
          plainTextContent: formData.plainTextContent,
          folderId: formData.folderId || undefined,
          tags: formData.tags,
          variables: extractVariables(formData.htmlContent + ' ' + formData.subject),
        });
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestApproval = async () => {
    if (selectedTemplate) {
      await requestApproval(selectedTemplate.id);
      onClose();
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(match => match.slice(2, -2)))];
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const canEdit = editorMode !== 'view';
  const isReadOnly = !canEdit;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {editorMode === 'create' && 'Create New Template'}
              {editorMode === 'edit' && 'Edit Template'}
              {editorMode === 'view' && 'View Template'}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {canEdit && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving || !formData.name.trim() || !formData.subject.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  {selectedTemplate?.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={handleRequestApproval}
                      className="bg-gradient-primary"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Request Approval
                    </Button>
                  )}
                </>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Email-like Interface */}
        <div className="flex-1 flex min-h-0 bg-muted/20">
          {/* Main Email Editor */}
          <div className="flex-1 flex flex-col bg-background mr-4 rounded-lg border border-border shadow-sm">
            {/* Email Header */}
            <div className="border-b border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>New Email Template</span>
                <Separator orientation="vertical" className="h-4" />
                <User className="h-4 w-4" />
                <span>{currentUser?.name || 'Template Author'}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="template-name" className="text-xs font-medium text-muted-foreground w-20">Template:</Label>
                  <Input
                    id="template-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                    readOnly={isReadOnly}
                    className="flex-1 h-8 text-sm border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label htmlFor="template-subject" className="text-xs font-medium text-muted-foreground w-20">Subject:</Label>
                  <Input
                    id="template-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter email subject line"
                    readOnly={isReadOnly}
                    className="flex-1 h-8 text-sm border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Email Body Editor */}
            <div className="flex-1 flex flex-col min-h-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="border-b border-border bg-muted/20">
                  <TabsList className="bg-transparent border-0 p-2 h-auto">
                    <TabsTrigger value="design" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <Type className="h-4 w-4 mr-2" />
                      Compose
                    </TabsTrigger>
                    <TabsTrigger value="html" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <Code className="h-4 w-4 mr-2" />
                      HTML
                    </TabsTrigger>
                    <TabsTrigger value="text" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <Type className="h-4 w-4 mr-2" />
                      Plain Text
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      Settings
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 p-4 min-h-0">
                  <TabsContent value="design" className="h-full m-0">
                    <div className="h-full">
                      <EmailRichEditor
                        value={formData.htmlContent}
                        onChange={(value) => setFormData(prev => ({ ...prev, htmlContent: value }))}
                        placeholder="Compose your email template..."
                        readOnly={isReadOnly}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="html" className="h-full m-0">
                    <Textarea
                      value={formData.htmlContent}
                      onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
                      placeholder="Enter HTML content"
                      className="font-mono text-sm h-full resize-none border-border"
                      readOnly={isReadOnly}
                    />
                  </TabsContent>

                  <TabsContent value="text" className="h-full m-0">
                    <Textarea
                      value={formData.plainTextContent}
                      onChange={(e) => setFormData(prev => ({ ...prev, plainTextContent: e.target.value }))}
                      placeholder="Enter plain text version"
                      className="h-full resize-none border-border"
                      readOnly={isReadOnly}
                    />
                  </TabsContent>

                  <TabsContent value="settings" className="h-full m-0">
                    <div className="space-y-6 max-w-md">
                      <div>
                        <Label className="text-sm font-medium">Folder</Label>
                        <select
                          value={formData.folderId}
                          onChange={(e) => setFormData(prev => ({ ...prev, folderId: e.target.value }))}
                          className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background text-sm z-50"
                          disabled={isReadOnly}
                        >
                          <option value="">No Folder</option>
                          {folders.map(folder => (
                            <option key={folder.id} value={folder.id}>
                              {folder.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2 mb-2">
                          {formData.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                              <span>{tag}</span>
                              {!isReadOnly && (
                                <button
                                  onClick={() => removeTag(tag)}
                                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                >
                                  ×
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                        {!isReadOnly && (
                          <div className="flex space-x-2">
                            <Input
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                              placeholder="Add tag"
                              className="flex-1 text-sm"
                            />
                            <Button onClick={addTag} variant="outline" size="sm">Add</Button>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Variables Found</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {extractVariables(formData.htmlContent + ' ' + formData.subject).map(variable => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-96 flex flex-col bg-background rounded-lg border border-border shadow-sm">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Live Preview</Label>
                <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
                  <Button
                    variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                    className="h-7 w-7 p-0"
                  >
                    <Monitor className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={previewMode === 'tablet' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('tablet')}
                    className="h-7 w-7 p-0"
                  >
                    <Tablet className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                    className="h-7 w-7 p-0"
                  >
                    <Smartphone className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Email Preview Header */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>Preview Email</span>
                </div>
                <div className="text-sm font-medium truncate">
                  {formData.subject || 'No subject'}
                </div>
                <div className="text-xs text-muted-foreground">
                  From: {currentUser?.email || 'template@company.com'}
                </div>
              </div>
            </div>

            <div className="flex-1 p-4">
              <div 
                className={cn(
                  "border border-border rounded bg-background overflow-auto min-h-full",
                  previewMode === 'desktop' && "w-full h-full",
                  previewMode === 'tablet' && "w-72 h-full mx-auto",
                  previewMode === 'mobile' && "w-52 h-full mx-auto"
                )}
              >
                <div 
                  className="p-4 min-h-full text-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: formData.htmlContent || '<p style="color: #6b7280; font-style: italic;">Start composing your email template...</p>' 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}