import React from 'react';
import { TemplateList } from '@/components/templates/TemplateList';
import { TemplateEditor } from '@/components/editor/TemplateEditor';
import { useTemplateStore } from '@/store/useTemplateStore';

export default function Templates() {
  const { isEditorOpen, setEditorOpen } = useTemplateStore();

  return (
    <div className="p-6">
      <TemplateList />
      <TemplateEditor 
        open={isEditorOpen} 
        onClose={() => setEditorOpen(false)} 
      />
    </div>
  );
}