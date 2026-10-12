// ─── Document Types ──────────────────────────────────────────

export type DocumentType = 'resume' | 'cover-letter';

export interface DocumentStudioState {
  // Document
  documentType: DocumentType;
  documentId: string | null;
  documentTitle: string;
  
  // View mode for mobile/tablet
  viewMode: 'editor' | 'preview' | 'ai';
  
  // Panels
  leftSidebarOpen: boolean;
  rightPanelOpen: boolean;
  
  // Left sidebar active section
  activeSection: string | null;
  
  // Right panel tab
  rightPanelTab: 'ai' | 'customize' | 'templates' | 'history';
  
  // Preview zoom
  previewZoom: number; // decimal 0.3 - 1.0
  previewFullscreen: boolean;
  
  // Autosave
  autosaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: string | null;
  
  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  
  // Dialogs
  generatorDialogOpen: boolean;
  templateDialogOpen: boolean;
  exportDialogOpen: boolean;
  deleteDialogOpen: boolean;
}

export interface DocumentStudioActions {
  // Document
  setDocumentType: (type: DocumentType) => void;
  setDocumentId: (id: string | null) => void;
  setDocumentTitle: (title: string) => void;
  
  // View mode
  setViewMode: (mode: 'editor' | 'preview' | 'ai') => void;
  
  // Panels
  toggleLeftSidebar: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  toggleRightPanel: () => void;
  setRightPanelOpen: (open: boolean) => void;
  
  // Sections
  setActiveSection: (section: string | null) => void;
  
  // Right panel
  setRightPanelTab: (tab: 'ai' | 'customize' | 'templates' | 'history') => void;
  
  // Preview
  setPreviewZoom: (zoom: number) => void;
  setPreviewFullscreen: (fullscreen: boolean) => void;
  
  // Autosave
  setAutosaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  setLastSaved: (time: string | null) => void;
  
  // Undo/Redo
  setCanUndo: (can: boolean) => void;
  setCanRedo: (can: boolean) => void;
  
  // Dialogs
  setGeneratorDialogOpen: (open: boolean) => void;
  setTemplateDialogOpen: (open: boolean) => void;
  setExportDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  
  // Reset
  resetForNewDocument: () => void;
}

export type DocumentStudioStore = DocumentStudioState & DocumentStudioActions;
