import { create } from 'zustand';
import type { DocumentStudioStore } from '@/components/document-studio/types';

export const useDocumentStudioStore = create<DocumentStudioStore>((set) => ({
  // Document
  documentType: 'cover-letter',
  documentId: null,
  documentTitle: 'Untitled Document',
  
  // View mode
  viewMode: 'preview',
  
  // Panels
  leftSidebarOpen: true,
  rightPanelOpen: true,
  
  // Left sidebar
  activeSection: null,
  
  // Right panel
  rightPanelTab: 'ai',
  
  // Preview
  previewZoom: 0.5,
  previewFullscreen: false,
  
  // Autosave
  autosaveStatus: 'idle',
  lastSaved: null,
  
  // Undo/Redo
  canUndo: false,
  canRedo: false,
  
  // Dialogs
  generatorDialogOpen: false,
  templateDialogOpen: false,
  exportDialogOpen: false,
  deleteDialogOpen: false,
  
  // Actions
  setDocumentType: (type) => set({ documentType: type, documentId: null, documentTitle: 'Untitled Document', activeSection: null }),
  setDocumentId: (id) => set({ documentId: id }),
  setDocumentTitle: (title) => set({ documentTitle: title }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setActiveSection: (section) => set({ activeSection: section }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setPreviewZoom: (zoom) => set({ previewZoom: Math.max(0.3, Math.min(1.0, zoom)) }),
  setPreviewFullscreen: (fullscreen) => set({ previewFullscreen: fullscreen }),
  setAutosaveStatus: (status) => set({ autosaveStatus: status }),
  setLastSaved: (time) => set({ lastSaved: time }),
  setCanUndo: (can) => set({ canUndo: can }),
  setCanRedo: (can) => set({ canRedo: can }),
  setGeneratorDialogOpen: (open) => set({ generatorDialogOpen: open }),
  setTemplateDialogOpen: (open) => set({ templateDialogOpen: open }),
  setExportDialogOpen: (open) => set({ exportDialogOpen: open }),
  setDeleteDialogOpen: (open) => set({ deleteDialogOpen: open }),
  resetForNewDocument: () => set({
    documentId: null,
    documentTitle: 'Untitled Document',
    activeSection: null,
    autosaveStatus: 'idle',
    lastSaved: null,
  }),
}));
