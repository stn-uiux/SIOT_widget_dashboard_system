import React from "react";
import "react-grid-layout/css/styles.css";
import {
  Layout,
  LayoutGrid,
  Edit3,
  Eye,
  Plus,
  Palette,
  BarChart3,
  TrendingUp,
  Activity,
  ChevronDown,
  EyeOff,
  CheckCircle2,
  Sun,
  Moon,
  Trash2,
  X,
  Download,
  Upload,
  LogOut,
  Camera,
  Info,
} from "lucide-react";
import { DEFAULT_HEADER } from "../../constants";
import {
  ThemeMode,
  ChartLibrary,
  HeaderPosition,
  TextAlignment,
  HeaderConfig,
} from "../../types";
import DesignSidebar from "../DesignSidebar";
import Sidebar from "../Sidebar";
import ExcelModal from "../ExcelModal";
import ConfirmModal from "../ConfirmModal";
import DesignDocs from "../DesignDocs";
import DesignSystem from "../../DesignSystem";
import WidgetPicker from "../WidgetPicker";
import GlobeBackground from "../GlobeBackground";
import FloatingAssistantButton from "../FloatingAssistantButton";
import { HeaderWidgetLayer } from "./header";
import { DashboardGrid } from "../dashboard/DashboardGrid";
import { getWidgetCaptureFileInfo } from "../../lib/exportWidgetScreenshots";
import { STN_LOGO_DARK_SRC, STN_LOGO_LIGHT_SRC } from "../../lib/appAssetUrls";
import { saneNum } from "../../hooks/useDashboard";
import type { UseDashboardApi } from "../../hooks/useDashboard";
import type { User } from "@supabase/supabase-js";
import type { RefObject } from "react";

export type DashboardShellExtras = {
  user: User | null;
  isAdmin: boolean;
  userRole: string;
  showLogoutModal: boolean;
  setShowLogoutModal: React.Dispatch<React.SetStateAction<boolean>>;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  isPreviewMode: boolean;
  setIsPreviewMode: React.Dispatch<React.SetStateAction<boolean>>;
  isDesignSidebarOpen: boolean;
  setIsDesignSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLayoutSidebarOpen: boolean;
  setIsLayoutSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedWidgetId: string | null;
  setSelectedWidgetId: React.Dispatch<React.SetStateAction<string | null>>;
  handleTogglePreview: () => void;
  pendingPanelSwitch: "design" | "layout" | "close" | null;
  setPendingPanelSwitch: React.Dispatch<React.SetStateAction<"design" | "layout" | "close" | null>>;
  appRootRef: RefObject<HTMLDivElement | null>;
  mainAreaRef: RefObject<HTMLDivElement | null>;
  projectScopeRef: RefObject<HTMLDivElement | null>;
  exportPreviewRef: RefObject<HTMLDivElement | null>;
  importInputRef: RefObject<HTMLInputElement | null>;
  mainAreaHeight: number;
  isProjectDropdownOpen: boolean;
  setIsProjectDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLibraryDropdownOpen: boolean;
  setIsLibraryDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDesignDocsOpen: boolean;
  setIsDesignDocsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingProjectId: string | null;
  setEditingProjectId: React.Dispatch<React.SetStateAction<string | null>>;
  editingProjectName: string;
  setEditingProjectName: React.Dispatch<React.SetStateAction<string>>;
  deleteConfirmId: string | null;
  setDeleteConfirmId: React.Dispatch<React.SetStateAction<string | null>>;
  deleteProjectId: string | null;
  setDeleteProjectId: React.Dispatch<React.SetStateAction<string | null>>;
  isFloatingGnbOpen: boolean;
  setIsFloatingGnbOpen: React.Dispatch<React.SetStateAction<boolean>>;
  panelPos: { x: number; y: number };
  setPanelPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isDraggingPanel: boolean;
  setIsDraggingPanel: React.Dispatch<React.SetStateAction<boolean>>;
  handleDragStart: (e: React.MouseEvent) => void;
  toast: { message: string; type: "success" | "error" | "info" } | null;
  setToast: React.Dispatch<React.SetStateAction<{ message: string; type: "success" | "error" | "info" } | null>>;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  isCapturingWidgets: boolean;
  widgetCaptureProgress: { index: number; total: number; title: string } | null;
  isWidgetCapturePickerOpen: boolean;
  setIsWidgetCapturePickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCaptureWidgetIds: string[];
  setSelectedCaptureWidgetIds: React.Dispatch<React.SetStateAction<string[]>>;
  widgetCaptureThumbs: Record<string, string>;
  handleOpenWidgetCapturePicker: () => void;
  handleConfirmWidgetScreensExport: () => void;
  allCaptureSelected: boolean;
  someCaptureSelected: boolean;
  captureMode: "light" | "dark";
  isThumbRefreshing: boolean;
  thumbRefreshPercent: number;
  isWidgetPickerOpen: boolean;
  setIsWidgetPickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleOpenWidgetPicker: () => void;
  deleteWidget: (id: string) => void;
  confirmDeleteWidget: () => void;
  handleWidgetSelect: (id: string | null) => void;
  handleToggleEditMode: () => void;
  handleOpenDesignSidebar: () => void;
  handleOpenLayoutSidebar: () => void;
  handleLogout: () => void | Promise<void>;
  confirmDeleteProject: () => void;
  handleExportClick: (target: "full" | "base") => void;
  handleProjectSave: () => void | Promise<void>;
  showSidebar: boolean;
  libraryOptions: readonly {
    value: ChartLibrary;
    label: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    colorVar: string;
  }[];
  currentLibrary: {
    value: ChartLibrary;
    label: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    colorVar: string;
  };
  header: HeaderConfig;
  pageBgUrl: string | undefined;
  showUnifiedBg: boolean;
};

export type DashboardShellProps = Omit<UseDashboardApi, "deleteWidget"> & DashboardShellExtras;

export const DashboardShell: React.FC<DashboardShellProps> = (props) => {
const {
  projects,
  setProjects,
  activeProjectId,
  setActiveProjectId,
  currentProject,
  currentPage,
  theme,
  widgets,
  layout,
  layoutStore,
  setLayoutStore,
  isHydrated,
  presets,
  setPresets,
  currentRglLayout,
  responsiveLayoutsForGrid,
  applyLayoutUpdate,
  updateCurrentPage,
  updateProjectTheme,
  handlePageChange,
  handleRglLayoutChange,
  handleResponsiveLayoutChange,
  replaceActiveProject,
  addWidgetWithType,
  updateWidget,
  updateHeader,
  handleApplyPreset,
  handleSavePreset,
  handleThemeChange,
  handleModeSwitch,
  handleUpdateLayout,
  addPage,
  deletePage,
  addProject,
  deleteProject,
  renameProject,
  onExcelUpload,
  handleImportChange,
  executeImport,
  performExportCapture,
  excelWidgetId,
  openExcelModal,
  closeExcelModal,
  capturingForExport,
  setCapturingForExport,
  exportPhase,
  setExportPhase,
  exportTarget,
  setExportTarget,
  importTarget,
  setImportTarget,
  isImporting,
  setIsImporting,
  showImportConfirm,
  setShowImportConfirm,
  pendingImportFile,
  setPendingImportFile,
  hideBarForCapture,
  setHideBarForCapture,
  save,
  reloadSampleProjects,
  user,
  isAdmin,
  userRole,
  showLogoutModal,
  setShowLogoutModal,
  isEditMode,
  setIsEditMode,
  isPreviewMode,
  setIsPreviewMode,
  isDesignSidebarOpen,
  setIsDesignSidebarOpen,
  isLayoutSidebarOpen,
  setIsLayoutSidebarOpen,
  selectedWidgetId,
  setSelectedWidgetId,
  handleTogglePreview,
  pendingPanelSwitch,
  setPendingPanelSwitch,
  appRootRef,
  mainAreaRef,
  projectScopeRef,
  exportPreviewRef,
  importInputRef,
  mainAreaHeight,
  isProjectDropdownOpen,
  setIsProjectDropdownOpen,
  isLibraryDropdownOpen,
  setIsLibraryDropdownOpen,
  isDesignDocsOpen,
  setIsDesignDocsOpen,
  editingProjectId,
  setEditingProjectId,
  editingProjectName,
  setEditingProjectName,
  deleteConfirmId,
  setDeleteConfirmId,
  deleteProjectId,
  setDeleteProjectId,
  isFloatingGnbOpen,
  setIsFloatingGnbOpen,
  panelPos,
  setPanelPos,
  isDraggingPanel,
  setIsDraggingPanel,
  handleDragStart,
  toast,
  setToast,
  showToast,
  isCapturingWidgets,
  widgetCaptureProgress,
  isWidgetCapturePickerOpen,
  setIsWidgetCapturePickerOpen,
  selectedCaptureWidgetIds,
  setSelectedCaptureWidgetIds,
  widgetCaptureThumbs,
  handleOpenWidgetCapturePicker,
  handleConfirmWidgetScreensExport,
  allCaptureSelected,
  someCaptureSelected,
  captureMode,
  isThumbRefreshing,
  thumbRefreshPercent,
  isWidgetPickerOpen,
  setIsWidgetPickerOpen,
  handleOpenWidgetPicker,
  deleteWidget,
  confirmDeleteWidget,
  handleWidgetSelect,
  handleToggleEditMode,
  handleOpenDesignSidebar,
  handleOpenLayoutSidebar,
  handleLogout,
  confirmDeleteProject,
  handleExportClick,
  handleProjectSave,
  showSidebar,
  libraryOptions,
  currentLibrary,
  header,
  pageBgUrl,
  showUnifiedBg
} = props;
  return (
    <div
      ref={appRootRef}
      className={`h-screen flex flex-col transition-colors duration-300 overflow-hidden bg-[var(--background)] text-[var(--text-main)] ${theme.mode !== ThemeMode.LIGHT ? "dark" : ""}`}
    >
      <ConfirmModal
        isOpen={showImportConfirm}
        title="프로젝트를 교체하시겠습니까?"
        message="불러오려는 파일의 내용으로 현재 프로젝트의 모든 위젯과 페이지가 덮어씌워집니다. 이 작업은 되돌릴 수 없습니다."
        confirmText="모두 교체하기"
        cancelText="취소"
        isDark={theme.mode === ThemeMode.DARK}
        onConfirm={() => {
          if (pendingImportFile) executeImport(pendingImportFile, 'full');
          setShowImportConfirm(false);
        }}
        onCancel={() => {
          setShowImportConfirm(false);
          setPendingImportFile(null);
          setImportTarget(null);
        }}
      />

      <DesignSystem theme={theme} />

      {/* 내보내기/불러오기 로딩 바 */}
      {(capturingForExport || isImporting) && !hideBarForCapture && (
        <div className="fixed top-0 left-0 right-0 z-[var(--gnb-z-index)] flex flex-col bg-[var(--surface)] border-b border-[var(--border-base)] shadow-lg">
          <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
            <span className="font-medium text-[var(--text-main)]" style={{ fontSize: 'var(--text-small)' }}>
              {isImporting ? "프로젝트 불러오기 중..." : (
                <>
                  {exportPhase === "waiting" && "내보내기 중… Preview 화면 렌더링 대기"}
                  {exportPhase === "capturing" && "내보내기 중… 미리보기 캡처"}
                  {exportPhase === "packing" && "내보내기 중… ZIP 파일 생성"}
                  {!exportPhase && "내보내기 중…"}
                </>
              )}
            </span>
          </div>
          <div className="w-full bg-[var(--border-muted)] overflow-hidden" style={{ height: 'var(--progress-track-height)' }}>
            <div
              className={`h-full bg-[var(--primary-color)] transition-all duration-500 ease-out ${isImporting ? 'animate-pulse' : ''}`}
              style={{
                width: isImporting ? "100%" : (
                  exportPhase === "waiting"
                    ? "33%"
                    : exportPhase === "capturing"
                      ? "66%"
                      : exportPhase === "packing"
                        ? "95%"
                        : "10%"
                ),
              }}
            />
          </div>
        </div>
      )}

      {/* Exit Preview — Premium Floating Icon Button */}
      {isPreviewMode && (
        <button
          onClick={() => {
            // Exit preview and ensure theme is consistent
            setIsPreviewMode(false);
            // If the user toggled the mode in preview, make sure the project theme reflects it fully
            const currentMode = theme.mode;
            const currentName = theme.name;
            updateProjectTheme({
              mode: currentMode,
              name: currentMode === ThemeMode.DARK ? "Dark Mode" : currentMode === ThemeMode.LIGHT ? "Light Mode" : currentName
            });
          }}
          className="fixed z-[var(--gnb-z-index)] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 shadow-premium group border-2 border-[var(--primary-color)]"
          style={{
            bottom: 'var(--spacing-xl)',
            right: 'var(--spacing-xl)',
            width: 'var(--ai-fab-size)',
            height: 'var(--ai-fab-size)',
            backgroundColor: 'var(--gnb-bg)',
            backdropFilter: 'blur(var(--gnb-blur))',
            borderRadius: 'var(--gnb-radius)',
            boxShadow: 'var(--gnb-shadow)',
          }}
          title="Exit Preview"
        >
          <div className="absolute inset-0 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" style={{ backgroundColor: 'var(--primary-focus-ring-bg)' }} />
          <EyeOff
            className="w-7 h-7 text-[var(--primary-color)] drop-shadow-md"
          />
        </button>
      )}

      {/* Floating GNB Capsule (Triggered by AI FAB) */}
      {user && (
        <div
          className={`fixed z-[var(--gnb-floating-stack-z-index)] transition-all duration-500 flex items-center ${isFloatingGnbOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}
          style={{
            bottom: 'var(--spacing-xl)',
            right: 'calc(var(--ai-fab-size) + var(--spacing-xl) + var(--spacing-md))',
            height: 'var(--gnb-height)',
            backgroundColor: 'var(--gnb-bg)',
            backdropFilter: 'blur(var(--gnb-blur))',
            borderRadius: 'var(--gnb-radius)',
            padding: '0 var(--gnb-padding-x)',
            border: 'var(--widget-border-width) solid var(--border-base)',
            boxShadow: 'var(--gnb-shadow)',
          }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img
                src={theme.mode === ThemeMode.DARK ? STN_LOGO_DARK_SRC : STN_LOGO_LIGHT_SRC}
                className="h-7 w-auto object-contain"
                alt="STN Logo"
              />
              
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <button
                      onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                      className="flex items-center gap-1.5 group"
                    >
                      <span className="uppercase font-bold transition-colors whitespace-nowrap" style={{ fontSize: 'var(--text-caption)', color: theme.titleColor }}>
                        {currentProject.name}
                      </span>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${isProjectDropdownOpen ? "rotate-180" : ""} text-muted`}
                      />
                    </button>

                    {isProjectDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsProjectDropdownOpen(false)}
                        />
                        <div
                          className="absolute bottom-full left-0 mb-4 w-64 p-2 shadow-premium z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 floating-panel-glow"
                          style={{ borderRadius: 'var(--radius-panel)' }}
                        >
                          <div className="px-3 py-2 mb-1 border-b border-[var(--border-muted)]">
                            <p className="uppercase font-bold text-muted tracking-widest" style={{ fontSize: 'var(--text-caption)' }}>
                              Select Project
                            </p>
                          </div>
                          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                            {projects.map((p) => (
                              <div
                                key={p.id}
                                className={`flex items-center group/proj gap-2 w-full px-4 py-2.5 mb-1 rounded-sm border transition-colors ${activeProjectId === p.id ? "bg-[var(--project-picker-row-active-bg)] border-[var(--project-picker-row-active-border)]" : "border-transparent hover:bg-[var(--project-picker-row-hover-bg)]"}`}
                              >
                                {editingProjectId === p.id ? (
                                  <div className="flex-1 flex items-center gap-2 min-w-0">
                                    <input
                                      autoFocus
                                      type="text"
                                      value={editingProjectName}
                                      onChange={(e) => setEditingProjectName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") renameProject(p.id, editingProjectName);
                                        if (e.key === "Escape") setEditingProjectId(null);
                                      }}
                                      onBlur={() => renameProject(p.id, editingProjectName)}
                                      className="flex-1 min-w-0 bg-transparent border-b border-[var(--primary-color)] font-bold outline-none uppercase tracking-tight text-[var(--text-main)] w-full"
                                      style={{ fontSize: 'var(--text-small)' }}
                                    />
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setActiveProjectId(p.id);
                                      setIsProjectDropdownOpen(false);
                                    }}
                                    className="flex-1 min-w-0 text-left"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold uppercase tracking-tight truncate" style={{ fontSize: 'var(--text-small)' }}>
                                        {p.name}
                                      </p>
                                    </div>
                                  </button>
                                )}

                                  <div className="hidden group-hover/proj:flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingProjectId(p.id);
                                        setEditingProjectName(p.name);
                                      }}
                                      className="p-1 text-muted hover:text-[var(--primary-color)] transition-colors inline-block"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteProjectId(p.id);
                                      }}
                                      className="p-1 text-muted hover:text-[var(--error)] transition-colors inline-block"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                {activeProjectId === p.id && editingProjectId !== p.id && (
                                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--primary-color)] group-hover/proj:hidden" />
                                )}
                              </div>
                            ))}
                          </div>
                           <div className="p-1 mt-1 border-t border-[var(--border-muted)] space-y-2">
                            <div className="flex flex-col gap-1.5 px-1 py-1">
                              <span className="font-black text-muted uppercase tracking-[0.2em] pl-1" style={{ fontSize: 'var(--text-micro)' }}>Project Sync</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  onClick={() => handleExportClick('full')}
                                  disabled={capturingForExport}
                                  className="btn-base btn-ghost p-2 rounded-lg flex flex-col items-center justify-center gap-1 group/btn border border-transparent transition-all"
                                  style={{
                                    borderColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--gnb-export-hover-border)';
                                    e.currentTarget.style.backgroundColor = 'var(--gnb-export-hover-bg)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <Upload className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" style={{ color: 'var(--gnb-export-text)' }} />
                                  <span className="font-extrabold uppercase whitespace-nowrap" style={{ fontSize: 'var(--text-micro)', color: 'var(--text-muted)' }}>
                                    Full Export
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleExportClick('base')}
                                  disabled={capturingForExport}
                                  className="btn-base btn-ghost p-2 rounded-lg flex flex-col items-center justify-center gap-1 group/btn border border-transparent transition-all"
                                  style={{
                                    borderColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--gnb-export-hover-border)';
                                    e.currentTarget.style.backgroundColor = 'var(--gnb-export-hover-bg)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <Palette className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" style={{ color: 'var(--gnb-export-text)' }} />
                                  <span className="font-extrabold uppercase whitespace-nowrap" style={{ fontSize: 'var(--text-micro)', color: 'var(--text-muted)' }}>
                                    Base Export
                                  </span>
                                </button>
                                <button
                                  onClick={() => {
                                    setImportTarget('full');
                                    importInputRef.current?.click();
                                  }}
                                  className="btn-base btn-ghost p-2 rounded-lg flex flex-col items-center justify-center gap-1 group/btn border border-transparent transition-all"
                                  style={{
                                    borderColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--gnb-import-hover-border)';
                                    e.currentTarget.style.backgroundColor = 'var(--gnb-import-hover-bg)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <Download className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" style={{ color: 'var(--gnb-import-text)' }} />
                                  <span className="font-extrabold uppercase whitespace-nowrap" style={{ fontSize: 'var(--text-micro)', color: 'var(--text-muted)' }}>
                                    Full Import
                                  </span>
                                </button>
                                <button
                                  onClick={() => {
                                    setImportTarget('base');
                                    importInputRef.current?.click();
                                  }}
                                  className="btn-base btn-ghost p-2 rounded-lg flex flex-col items-center justify-center gap-1 group/btn border border-transparent transition-all"
                                  style={{
                                    borderColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--gnb-import-hover-border)';
                                    e.currentTarget.style.backgroundColor = 'var(--gnb-import-hover-bg)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <Palette className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" style={{ color: 'var(--gnb-import-text)' }} />
                                  <span className="font-extrabold uppercase whitespace-nowrap" style={{ fontSize: 'var(--text-micro)', color: 'var(--text-muted)' }}>
                                    Base Import
                                  </span>
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={handleOpenWidgetCapturePicker}
                                disabled={capturingForExport || !!exportPhase || isCapturingWidgets || widgets.length === 0}
                                className="btn-base btn-ghost w-full p-2 rounded-lg flex flex-row items-center justify-center gap-2 group/btn border border-transparent transition-all"
                                style={{ borderColor: "transparent" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = "var(--gnb-export-hover-border)";
                                  e.currentTarget.style.backgroundColor = "var(--gnb-export-hover-bg)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = "transparent";
                                  e.currentTarget.style.backgroundColor = "transparent";
                                }}
                              >
                                <Camera className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform shrink-0" style={{ color: "var(--gnb-export-text)" }} />
                                <span className="font-extrabold uppercase" style={{ fontSize: "var(--text-micro)", color: "var(--text-muted)" }}>
                                  {isCapturingWidgets ? "Capturing…" : "Widget PNG (ZIP)"}
                                </span>
                              </button>

                              {isAdmin && (
                                <>
                                  <button
                                    onClick={addProject}
                                    className="btn-base btn-ghost w-full px-4 py-2.5 text-primary rounded-sm flex items-center justify-center gap-2 border border-transparent hover:border-[var(--btn-outline-primary-hover-border)]"
                                  >
                                    <Plus className="w-4 h-4" />{" "}
                                    <span className="font-bold uppercase" style={{ fontSize: 'var(--text-caption)' }}>
                                      New Project
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (!window.confirm("저장된 프로젝트·레이아웃을 지우고 번들 샘플 프로젝트 4개를 다시 불러올까요? 이 작업은 되돌릴 수 없습니다.")) {
                                        return;
                                      }
                                      const ok = await reloadSampleProjects();
                                      setIsProjectDropdownOpen(false);
                                      showToast(
                                        ok ? "샘플 프로젝트 4개를 불러왔습니다." : "샘플 불러오기에 실패했습니다. 콘솔과 네트워크를 확인해 주세요.",
                                        ok ? "success" : "error",
                                      );
                                    }}
                                    className="btn-base btn-ghost w-full px-4 py-2.5 rounded-sm flex items-center justify-center gap-2 border border-transparent hover:border-[var(--border-base)]"
                                  >
                                    <span className="font-bold uppercase text-[var(--text-muted)]" style={{ fontSize: 'var(--text-micro)' }}>
                                      샘플 프로젝트 4개로 리셋하기
                                    </span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                </div>
              </div>
            </div>

            {userRole === 'admin' && (
              <>
                <div className="h-6 w-px bg-[var(--border-base)] mx-4" />
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setIsLibraryDropdownOpen(!isLibraryDropdownOpen)}
                      className={`btn-base btn-surface ${isLibraryDropdownOpen ? "active" : ""}`}
                      style={{ 
                        backgroundColor: isLibraryDropdownOpen ? undefined : 'var(--gnb-btn-bg)',
                        height: 'var(--gnb-btn-height)',
                        paddingLeft: 'var(--gnb-btn-padding-x)',
                        paddingRight: 'var(--gnb-btn-padding-x)',
                        borderRadius: 'var(--gnb-btn-radius)'
                      }}
                    >
                      <div
                        className="icon-box w-5 h-5 rounded-md flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `color-mix(in srgb, var(${currentLibrary.colorVar}) 12%, transparent)`, color: `var(${currentLibrary.colorVar})` }}
                      >
                        <currentLibrary.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold" style={{ fontSize: 'var(--text-small)' }}>{currentLibrary.label}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isLibraryDropdownOpen ? 'rotate-180' : ''} text-[var(--text-muted-icon-dim)] group-hover:text-primary`} />
                    </button>

                    {isLibraryDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsLibraryDropdownOpen(false)} />
                        <div
                          className="absolute bottom-full right-0 mb-4 shadow-premium z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 floating-panel-glow"
                          style={{ 
                            width: 'var(--gnb-dropdown-width)',
                            borderRadius: 'var(--gnb-dropdown-radius)',
                            padding: 'var(--gnb-dropdown-padding)'
                          }}
                        >
                          {libraryOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => {
                                handleThemeChange({ ...theme, chartLibrary: opt.value as ChartLibrary });
                                setIsLibraryDropdownOpen(false);
                              }}
                              className={`w-full justify-between flex items-center transition-all btn-base btn-ghost mb-1 ${theme.chartLibrary === opt.value ? "active" : ""}`}
                              style={{ 
                                height: 'var(--gnb-item-height)',
                                borderRadius: 'var(--gnb-item-radius)',
                                paddingLeft: 'var(--gnb-item-padding-x)',
                                paddingRight: 'var(--gnb-item-padding-x)'
                              }}
                            >
                              <div className="flex items-center" style={{ gap: 'var(--gnb-item-gap)' }}>
                                <opt.icon className="w-4 h-4" style={{ color: `var(${opt.colorVar})` }} />
                                <span className="uppercase tracking-tight" style={{ fontSize: 'var(--gnb-item-font-size)', fontWeight: 'var(--gnb-item-font-weight)' }}>{opt.label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleOpenDesignSidebar}
                    className={`btn-base btn-surface ${isDesignSidebarOpen ? "active" : ""}`}
                    style={{ 
                      backgroundColor: isDesignSidebarOpen ? undefined : 'var(--gnb-btn-bg)',
                      height: 'var(--gnb-btn-height)',
                      paddingLeft: 'var(--gnb-btn-padding-x)',
                      paddingRight: 'var(--gnb-btn-padding-x)',
                      borderRadius: 'var(--gnb-btn-radius)'
                    }}
                  >
                    <Palette className="group-hover:scale-110 transition-transform" style={{ width: 'var(--gnb-icon-size)', height: 'var(--gnb-icon-size)', color: isDesignSidebarOpen ? 'var(--gnb-icon-active-color)' : 'var(--gnb-icon-color)' }} /> 
                    <span
                      className="font-bold tracking-tighter"
                      style={{ fontSize: 'var(--text-small)', color: isDesignSidebarOpen ? 'var(--white)' : undefined }}
                    >
                      Design
                    </span>
                  </button>
                  <button
                    onClick={handleOpenLayoutSidebar}
                    className={`btn-base btn-surface ${isLayoutSidebarOpen ? "active" : ""}`}
                    style={{ 
                      backgroundColor: isLayoutSidebarOpen ? undefined : 'var(--gnb-btn-bg)',
                      height: 'var(--gnb-btn-height)',
                      paddingLeft: 'var(--gnb-btn-padding-x)',
                      paddingRight: 'var(--gnb-btn-padding-x)',
                      borderRadius: 'var(--gnb-btn-radius)'
                    }}
                  >
                    <LayoutGrid className="group-hover:scale-110 transition-transform" style={{ width: 'var(--gnb-icon-size)', height: 'var(--gnb-icon-size)', color: isLayoutSidebarOpen ? 'var(--gnb-icon-active-color)' : 'var(--gnb-icon-color)' }} /> 
                    <span
                      className="font-bold tracking-tighter"
                      style={{ fontSize: 'var(--text-small)', color: isLayoutSidebarOpen ? 'var(--white)' : undefined }}
                    >
                      Layout
                    </span>
                  </button>
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`btn-base btn-surface ${isEditMode ? "active" : ""}`}
                    style={{ 
                      backgroundColor: isEditMode ? undefined : 'var(--gnb-btn-bg)',
                      height: 'var(--gnb-btn-height)',
                      paddingLeft: 'var(--gnb-btn-padding-x)',
                      paddingRight: 'var(--gnb-btn-padding-x)',
                      borderRadius: 'var(--gnb-btn-radius)'
                    }}
                  >
                    <Edit3 className="group-hover:scale-110 transition-transform" style={{ width: 'var(--gnb-icon-size)', height: 'var(--gnb-icon-size)', color: isEditMode ? 'var(--gnb-icon-active-color)' : 'var(--gnb-icon-color)' }} /> 
                    <span
                      className="font-bold tracking-tighter"
                      style={{
                        fontSize: 'var(--text-small)',
                        color: isEditMode ? 'var(--white)' : undefined
                      }}
                    >
                      Edit
                    </span>
                  </button>
                  <button
                    disabled={isEditMode}
                    onClick={() => {
                      setIsPreviewMode(!isPreviewMode);
                      if (!isPreviewMode) setIsFloatingGnbOpen(false);
                    }}
                    className={`btn-base btn-surface ${isEditMode ? "opacity-40 grayscale pointer-events-none" : ""} ${isPreviewMode ? "active" : ""}`}
                    style={{ 
                      backgroundColor: isPreviewMode ? undefined : 'var(--gnb-btn-bg)',
                      height: 'var(--gnb-btn-height)',
                      paddingLeft: 'var(--gnb-btn-padding-x)',
                      paddingRight: 'var(--gnb-btn-padding-x)',
                      borderRadius: 'var(--gnb-btn-radius)'
                    }}
                  >
                    {isPreviewMode ? (
                      <EyeOff className="group-hover:scale-110 transition-transform" style={{ width: 'var(--gnb-icon-size)', height: 'var(--gnb-icon-size)', color: 'var(--gnb-icon-active-color)' }} />
                    ) : (
                      <Eye className="group-hover:scale-110 transition-transform" style={{ width: 'var(--gnb-icon-size)', height: 'var(--gnb-icon-size)', color: 'var(--gnb-icon-color)' }} />
                    )}
                    <span
                      className="font-bold tracking-tighter"
                      style={{ fontSize: 'var(--text-small)', color: isPreviewMode ? 'var(--white)' : undefined }}
                    >
                      {isPreviewMode ? "Exit Preview" : "Preview"}
                    </span>
                  </button>
                </div>
              </>
            )}

            {/* User Info & Logout */}
            <div className="h-6 w-px bg-[var(--border-base)] mx-2" />
            <div className="flex items-center gap-3 pl-2 pr-1">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {userRole === 'admin' && (
                    <span 
                      className="px-1.5 py-0.5 border rounded-full font-black tracking-widest leading-none"
                      style={{ 
                        fontSize: 'var(--text-nano)',
                        backgroundColor: 'var(--gnb-user-badge-bg)', 
                        borderColor: 'color-mix(in srgb, var(--gnb-user-badge-text) 30%, transparent)',
                        color: 'var(--gnb-user-badge-text)'
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                  <span 
                    className="font-black leading-none tracking-widest uppercase"
                    style={{ fontSize: 'var(--text-caption)', color: 'var(--gnb-user-label-color)' }}
                  >
                    System User
                  </span>
                </div>
                <span 
                  className="font-bold" 
                  style={{ fontSize: 'var(--text-small)', color: 'var(--gnb-user-id-color)' }}
                >
                  {user?.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 gnb-logout-btn"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={importInputRef}
        onChange={handleImportChange}
        style={{ display: "none" }}
        accept=".zip"
      />

      {/* Main Workspace — sidebars are OUTSIDE the project theme scope now */}
      <div className={`flex-1 flex overflow-hidden relative transition-colors duration-300 ${showUnifiedBg ? 'bg-transparent' : 'bg-[var(--background)]'} text-[var(--text-main)]`}>
        {/* Unified Page Background (Image or Globe) — now placed here to cover both header and main content */}
        {showUnifiedBg && (
          <div
            key={layout?.backgroundGlobe ? 'bg-globe' : 'bg-image'}
            className={`absolute inset-0 z-0 overflow-hidden fade-in pointer-events-auto ${layout?.backgroundAnimation ? 'animate-pulse' : ''}`}
            aria-hidden
            onWheel={layout?.backgroundGlobe ? (e) => {
              const main = mainAreaRef.current;
              if (main) {
                main.scrollTop += e.deltaY;
                e.preventDefault();
              }
            } : undefined}
          >
            {layout?.backgroundGlobe ? <GlobeBackground mode={theme.mode} /> : null}
            {pageBgUrl && (
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: `url(${pageBgUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            )}
          </div>
        )}

        {/* Left Side Header (if positioned LEFT) */}
        {header.show && header.position === HeaderPosition.LEFT && (
          <aside
            style={{
              width: `${header.width}px`,
              backgroundColor: (theme.mode === ThemeMode.LIGHT ? (header.backgroundImageLight || header.backgroundImage) : (header.backgroundImageDark || header.backgroundImage)) ? 'transparent' : (header.backgroundColor === 'transparent' || (showUnifiedBg && header.backgroundColor === 'var(--background)') ? 'transparent' : header.backgroundColor),
              color: header.textColor,
              padding: `${header.padding}px`,
              margin: `${header.margin}px`,
              position: 'relative',
              overflow: 'visible',
            }}
            className={`flex flex-col transition-all h-full shrink-0 ${header.backgroundColor !== "transparent" ? "shadow-sm" : ""} ${header.showDivider !== false && header.backgroundColor !== "transparent" ? "border-r border-[var(--border-base)]" : ""}`}
          >
            {(() => {
              const hBg = theme.mode === ThemeMode.LIGHT ? (header.backgroundImageLight || header.backgroundImage) : (header.backgroundImageDark || header.backgroundImage);
              if (!hBg) return null;
              return (
                <div
                  className="absolute inset-0 z-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${hBg})`,
                    backgroundPosition: 'top left',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    width: '200%',
                    height: '100%',
                  }}
                />
              );
            })()}
            <HeaderWidgetLayer
              header={header}
              isEditMode={isEditMode}
              onUpdate={updateHeader}
              theme={theme}
              onModeSwitch={handleModeSwitch}
              isPreviewMode={isPreviewMode}
            />
            <div
              className={`mb-8 flex flex-col items-${header.textAlignment === TextAlignment.CENTER ? "center" : header.textAlignment === TextAlignment.RIGHT ? "end" : "start"} ${header.textAlignment === TextAlignment.CENTER ? "text-center" : header.textAlignment === TextAlignment.RIGHT ? "text-right" : "text-left"}`}
            >
              {header.logo && (
                <img
                  src={header.logo}
                  alt="Logo"
                  className="h-8 w-auto mb-4 object-contain"
                />
              )}
              <h2 className="font-black tracking-tighter uppercase" style={{ fontSize: header.headerTitleSize ? `${header.headerTitleSize}px` : `${DEFAULT_HEADER.headerTitleSize}px` }}>
                {header.title}
              </h2>
            </div>


          </aside>
        )}

        {/* Central Area: Dashboard grid (ref for export preview capture). 지구 배경 시 pointer-events-none으로 빈 공간 클릭이 지구로 전달되게 함 */}
        <div
          ref={(el) => {
            // @ts-ignore
            projectScopeRef.current = el;
            // @ts-ignore
            exportPreviewRef.current = el;
          }}
          className={`flex-1 flex flex-col relative text-[var(--text-main)] transition-colors duration-300 ${showUnifiedBg ? "bg-transparent" : "bg-[var(--background)]"
            } ${layout?.backgroundGlobe ? "pointer-events-none" : ""}`}
        >
          {/* Top Header (if positioned TOP) */}
          {header.show && header.position === HeaderPosition.TOP && (
            <header
              style={{
                height: `${header.height}px`,
                backgroundColor: (theme.mode === ThemeMode.LIGHT ? (header.backgroundImageLight || header.backgroundImage) : (header.backgroundImageDark || header.backgroundImage)) ? 'transparent' : (header.backgroundColor === 'transparent' || (showUnifiedBg && header.backgroundColor === 'var(--background)') ? 'transparent' : header.backgroundColor),
                color: header.textColor,
                padding: `0 ${header.padding}px`,
                margin: `${header.margin}px`,
                position: 'relative',
                overflow: 'visible',
              }}
              className={`flex items-center transition-all shrink-0 z-30 ${header.backgroundColor !== "transparent" ? "shadow-sm" : ""} ${header.showDivider !== false && header.backgroundColor !== "transparent" ? "border-b border-[var(--border-base)]" : ""} ${layout?.backgroundGlobe ? "pointer-events-auto" : ""}`}
            >
              {(() => {
                const hBg = theme.mode === ThemeMode.LIGHT ? (header.backgroundImageLight || header.backgroundImage) : (header.backgroundImageDark || header.backgroundImage);
                if (!hBg || hBg === 'none') return null;
                return (
                  <div
                    className="absolute top-0 left-0 right-0 z-0 pointer-events-none"
                    style={{
                      backgroundImage: `url(${hBg})`,
                      backgroundPosition: 'var(--header-bg-position, top left)',
                      backgroundSize: 'var(--header-bg-size, cover)',
                      backgroundRepeat: 'var(--header-bg-repeat, no-repeat)',
                      height: '100vh',
                    }}
                  />
                );
              })()}
              <HeaderWidgetLayer
                header={header}
                isEditMode={isEditMode}
                onUpdate={updateHeader}
                theme={theme}
                onModeSwitch={handleModeSwitch}
                isPreviewMode={isPreviewMode}
              />
              <div
                className={`flex items-center gap-8 w-full relative ${header.textAlignment === TextAlignment.CENTER
                  ? "justify-between"
                  : header.textAlignment === TextAlignment.RIGHT
                    ? "flex-row-reverse"
                    : "justify-between"
                  }`}
              >
                {/* Title & Toggle Section */}
                <div
                  className={`flex items-center gap-6 ${header.textAlignment === TextAlignment.RIGHT ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex items-center gap-3 ${header.textAlignment === TextAlignment.CENTER
                      ? "absolute left-1/2 -translate-x-1/2 px-4"
                      : ""
                      } ${header.textAlignment === TextAlignment.RIGHT ? "flex-row-reverse" : ""}`}
                  >
                    {/* Logo removed as requested to restore layout */}

                    <h2
                      className="font-black tracking-tighter whitespace-nowrap"
                      style={{
                        fontSize: header.headerTitleSize ? `${header.headerTitleSize}px` : `${DEFAULT_HEADER.headerTitleSize}px`,
                        color: theme.mode === ThemeMode.LIGHT ? (header.textColorLight || header.textColor) : (header.textColorDark || header.textColor)
                      }}
                    >
                      {header.title}
                    </h2>
                  </div>
                </div>


              </div>
            </header>
          )}

          {/* Widgets Grid Container — 배경만 플리커, 위젯은 고정. backgroundGlobe 시 지구 배경 + 마우스 드래그 회전 */}
          <main
            ref={mainAreaRef}
            className={`flex-1 relative custom-scrollbar transition-all ${layout.fitToScreen ? "h-full overflow-hidden" : "overflow-y-auto"} ${layout?.backgroundGlobe ? "globe-background-active pointer-events-none" : ""}`}
            style={layout?.glassmorphism ? (() => {
              const p = (layout.glassmorphismOpacity ?? (theme.mode === ThemeMode.DARK ? 35 : 55)) / 100;
              const alpha = Math.pow(p, 0.72);
              const blurPx = Math.round(alpha * 12);
              return {
                ['--glass-opacity' as string]: String(alpha),
                ['--glass-bg' as string]: `rgba(var(--glass-bg-rgb), ${alpha})`,
                ['--glass-blur' as string]: `${blurPx}px`,
              };
            })() : undefined}
          >
            <div className={`relative z-10 h-full min-h-0 ${layout?.backgroundGlobe ? "pointer-events-none" : ""}`}>
              <DashboardGrid
                layout={layout}
                theme={theme}
                widgets={widgets}
                currentRglLayout={currentRglLayout}
                mainAreaHeight={mainAreaHeight}
                isEditMode={isEditMode}
                selectedWidgetId={selectedWidgetId}
                onLayoutChange={handleRglLayoutChange}
                responsiveLayouts={responsiveLayoutsForGrid}
                onResponsiveLayoutChange={handleResponsiveLayoutChange}
                onWidgetSelect={handleWidgetSelect}
                onUpdateWidget={updateWidget}
                onDeleteWidget={deleteWidget}
                onOpenExcel={openExcelModal}
                onOpenWidgetPicker={handleOpenWidgetPicker}
                isPreviewMode={isPreviewMode}
                onTogglePreview={handleTogglePreview}
                userRole={userRole}
              />
            </div>
          </main>
        </div>

        {/* 3. Floating Panel (Design or Settings) */}
        {showSidebar && (
          <div
            className={`fixed z-50 transition-[transform,opacity,shadow] duration-200 ${isDraggingPanel ? 'transition-none pointer-events-none' : ''}`}
            style={{
              top: `${panelPos.y}px`,
              right: `${panelPos.x}px`,
              width: 'var(--panel-width)',
              maxHeight: 'calc(100vh - var(--panel-max-height-offset))',
              display: 'flex',
              flexDirection: 'column',
              cursor: isDraggingPanel ? 'move' : 'default'
            }}
          >
            <div className={`pointer-events-auto flex flex-col overflow-hidden shadow-2xl floating-panel-glow`} style={{ borderRadius: 'var(--panel-radius)', maxHeight: '100%' }}>
              {isDesignSidebarOpen ? (
                <DesignSidebar
                  theme={theme}
                  header={header}
                  currentPage={currentPage}
                  updateTheme={handleThemeChange}
                  updateHeader={updateHeader}
                  onUpdatePage={updateCurrentPage}
                  presets={presets}
                  onSavePreset={handleSavePreset}
                  onApplyPreset={handleApplyPreset}
                  onOpenDocs={() => setIsDesignDocsOpen(true)}
                  onClose={() => setIsDesignSidebarOpen(false)}
                  onModeSwitch={handleModeSwitch}
                  onDragStart={handleDragStart}
                  onSave={() => save()}
                />
              ) : selectedWidgetId ? (
                <Sidebar
                  theme={theme}
                  selectedWidget={(() => {
                    const w = widgets.find((w) => w.id === selectedWidgetId) || null;
                    if (!w) return null;
                    return { ...w, colSpan: saneNum(Number(w.colSpan), 4), rowSpan: saneNum(Number(w.rowSpan), 4) };
                  })()}
                  layout={layout}
                  onUpdateWidget={updateWidget}
                  onUpdateLayout={handleUpdateLayout}
                  onUpdateTheme={handleThemeChange}
                  onBatchUpdateWidgets={(updates) => {
                    updateCurrentPage({
                      widgets: widgets.map((w) => ({ ...w, ...updates })),
                    });
                    showToast("모든 위젯에 설정이 적용되었습니다.");
                  }}
                  onClose={() => setSelectedWidgetId(null)}
                  onDragStart={handleDragStart}
                  onSave={() => save()}
                />
              ) : isLayoutSidebarOpen ? (
                <Sidebar
                  theme={theme}
                  selectedWidget={null}
                  layout={layout}
                  onUpdateWidget={updateWidget}
                  onUpdateLayout={handleUpdateLayout}
                  onUpdateTheme={handleThemeChange}
                  onBatchUpdateWidgets={(updates) => {
                    updateCurrentPage({
                      widgets: widgets.map((w) => ({ ...w, ...updates })),
                    });
                    showToast("모든 위젯에 설정이 적용되었습니다.");
                  }}
                  onClose={() => setIsLayoutSidebarOpen(false)}
                  onDragStart={handleDragStart}
                  onSave={() => save()}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Excel Integration Modal */}
      <ExcelModal
        isOpen={excelWidgetId !== null}
        onClose={closeExcelModal}
        widget={widgets.find((w) => w.id === excelWidgetId) || null}
        onUpload={onExcelUpload}
        isDark={theme.mode === ThemeMode.DARK}
      />

      {/* Premium Toast Notification */}
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Widget 삭제"
        message="이 위젯을 정말로 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
        confirmText="삭제하기"
        cancelText="취소"
        onConfirm={confirmDeleteWidget}
        onCancel={() => setDeleteConfirmId(null)}
        isDark={theme.mode === ThemeMode.DARK}
      />
      <ConfirmModal
        isOpen={deleteProjectId !== null}
        title="프로젝트 삭제"
        message="이 프로젝트를 정말로 삭제하시겠습니까? 삭제된 프로젝트와 위젯은 복구할 수 없습니다."
        confirmText="삭제하기"
        cancelText="취소"
        onConfirm={confirmDeleteProject}
        onCancel={() => setDeleteProjectId(null)}
        isDark={theme.mode === ThemeMode.DARK}
      />

      <ConfirmModal
        isOpen={showLogoutModal}
        title="로그아웃"
        message="정말로 로그아웃하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        isDark={theme.mode === ThemeMode.DARK}
      />

      {/* 패널 전환 저장 확인 모달 */}
      <ConfirmModal
        isOpen={pendingPanelSwitch !== null}
        title="변경 사항 저장"
        message="다른 패널로 전환하기 전에 지금까지의 변경 사항을 저장하시겠습니까?"
        confirmText="저장 후 전환"
        cancelText="그냥 전환"
        onConfirm={async () => {
          await save();
          if (pendingPanelSwitch === 'design') {
            setIsDesignSidebarOpen(true);
            setIsLayoutSidebarOpen(false);
          } else if (pendingPanelSwitch === 'layout') {
            setIsLayoutSidebarOpen(true);
            setIsDesignSidebarOpen(false);
          }
          setPendingPanelSwitch(null);
          setSelectedWidgetId(null);
        }}
        onCancel={() => {
          if (pendingPanelSwitch === 'design') {
            setIsDesignSidebarOpen(true);
            setIsLayoutSidebarOpen(false);
          } else if (pendingPanelSwitch === 'layout') {
            setIsLayoutSidebarOpen(true);
            setIsDesignSidebarOpen(false);
          }
          setPendingPanelSwitch(null);
          setSelectedWidgetId(null);
        }}
        isDark={theme.mode === ThemeMode.DARK}
      />

      {isWidgetCapturePickerOpen && (
        <div className="widget-capture-modal-overlay">
          <div className="widget-capture-modal-backdrop" onClick={() => setIsWidgetCapturePickerOpen(false)} />
          <div className="widget-capture-modal">
            <div className="widget-capture-modal-header">
              <div className="widget-capture-modal-title-wrap">
                <h3 className="widget-capture-modal-title">Widget PNG 선택 캡처</h3>
                <p className="widget-capture-modal-desc">
                  캡처 대상 선택 후 저장합니다. 파일명은 타입 기반으로 자동 지정됩니다.
                </p>
              </div>
              <button className="widget-action-btn widget-capture-close-btn" onClick={() => setIsWidgetCapturePickerOpen(false)}>
                <X />
              </button>
            </div>

            <div className="widget-capture-modal-toolbar">
              <label className="widget-capture-toolbar-check">
                <input
                  type="checkbox"
                  checked={allCaptureSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someCaptureSelected;
                  }}
                  onChange={() => {
                    if (allCaptureSelected) setSelectedCaptureWidgetIds([]);
                    else setSelectedCaptureWidgetIds(widgets.map((w) => w.id));
                  }}
                />
                <span className="widget-capture-item-title">
                  전체 선택 / 해제 ({selectedCaptureWidgetIds.length}/{widgets.length})
                </span>
              </label>
              <span className="widget-capture-item-type">현재 모드: {captureMode}</span>
            </div>

            <div className="widget-capture-modal-list">
              {widgets.map((w) => {
                const checked = selectedCaptureWidgetIds.includes(w.id);
                const info = getWidgetCaptureFileInfo({ id: w.id, title: w.title || String(w.type), type: String(w.type) }, captureMode);
                return (
                  <label
                    key={`capture-pick-${w.id}`}
                    className={`widget-capture-item ${checked ? 'is-selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      className="widget-capture-item-check"
                      checked={checked}
                      onChange={() => {
                        setSelectedCaptureWidgetIds((prev) =>
                          checked ? prev.filter((id) => id !== w.id) : [...prev, w.id]
                        );
                      }}
                    />
                    <img
                      src={widgetCaptureThumbs[w.id] || info.previewSrc}
                      alt={w.title || String(w.type)}
                      className="widget-capture-item-thumb"
                      data-fallback-light={`/assets/widget/light/${info.category}/${info.base}_light.png`}
                      data-fallback-dark-default="/assets/widget/dark/graph/bar_graph_dark.png"
                      data-fallback-light-default="/assets/widget/light/graph/bar_graph_light.png"
                      onError={(e) => {
                        const img = e.currentTarget;
                        const currentSrc = img.getAttribute('src') || '';
                        const sameTypeLight = img.dataset.fallbackLight || '';
                        const defaultDark = img.dataset.fallbackDarkDefault || '';
                        const defaultLight = img.dataset.fallbackLightDefault || '';

                        // 다크 모드에서는 절대 라이트 썸네일로 폴백하지 않음
                        if (captureMode === 'dark') {
                          if (defaultDark && currentSrc !== defaultDark) {
                            img.src = defaultDark;
                            return;
                          }
                          img.onerror = null;
                          return;
                        }

                        // 라이트 모드에서는 동일 타입 라이트 -> 공통 라이트 순서 폴백
                        if (sameTypeLight && currentSrc !== sameTypeLight) {
                          img.src = sameTypeLight;
                          return;
                        }
                        if (defaultLight && currentSrc !== defaultLight) {
                          img.src = defaultLight;
                          return;
                        }
                        if (defaultDark && currentSrc !== defaultDark) {
                          img.src = defaultDark;
                          return;
                        }
                        img.onerror = null;
                      }}
                    />
                    <div className="widget-capture-item-meta">
                      <div className="widget-capture-item-title truncate">{w.title || String(w.type)}</div>
                      <div className="widget-capture-item-type truncate">{String(w.type)}</div>
                      <div className="widget-capture-item-file truncate">
                        {`${info.category}/${info.filename}`}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="widget-capture-modal-footer">
              <button className="btn-base btn-surface widget-capture-btn-cancel" onClick={() => setIsWidgetCapturePickerOpen(false)}>
                취소
              </button>
              <button
                className="btn-base widget-capture-btn-confirm"
                style={{ backgroundColor: 'var(--primary-color)' }}
                onClick={handleConfirmWidgetScreensExport}
                disabled={selectedCaptureWidgetIds.length === 0}
              >
                선택한 위젯 캡처 ({selectedCaptureWidgetIds.length})
              </button>
            </div>
            {isThumbRefreshing && (
              <div className="widget-capture-refresh-progress-wrap" role="status" aria-live="polite">
                <div
                  className="widget-capture-refresh-progress-bar"
                  style={{ width: `${thumbRefreshPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[var(--gnb-z-index)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 px-6 py-4 bg-[var(--surface)] border border-[var(--border-base)] shadow-premium rounded min-w-[var(--panel-min-width)]">
            <div
              className="w-10 h-10 rounded-sm flex items-center justify-center"
              style={
                toast.type === "success"
                  ? { backgroundColor: 'color-mix(in srgb, var(--success) 10%, transparent)', color: 'var(--success)' }
                  : toast.type === "info"
                    ? { backgroundColor: 'color-mix(in srgb, var(--primary-color) 12%, transparent)', color: 'var(--primary-color)' }
                    : { backgroundColor: 'var(--action-danger-hover-bg)', color: 'var(--error)' }
              }
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : toast.type === "info" ? (
                <Info className="w-5 h-5" />
              ) : (
                <Activity className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="uppercase font-bold text-muted tracking-widest mb-0.5" style={{ fontSize: 'var(--text-caption)' }}>
                시스템 알림
              </p>
              <p className="font-bold text-main" style={{ fontSize: 'var(--text-small)' }}>{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-lg transition-colors hover:bg-[var(--border-muted)]"
            >
              <Plus className="w-4 h-4 rotate-45 text-muted" />
            </button>
          </div>
        </div>
      )}

      {isCapturingWidgets && widgetCaptureProgress && (
        <div className="fixed inset-0 z-[var(--add-widget-pill-z-index)] pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundColor: 'color-mix(in srgb, var(--black) 25%, transparent)' }} />
          <div className="absolute left-1/2 top-10 -translate-x-1/2 pointer-events-none">
            <div className="px-6 py-4 rounded shadow-premium border border-[var(--border-base)] bg-[var(--surface)] min-w-[var(--panel-min-width)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full animate-spin"
                    style={{
                      border: '3px solid color-mix(in srgb, var(--primary-color) 25%, transparent)',
                      borderTopColor: 'var(--primary-color)',
                    }}
                  />
                  <div>
                    <div className="uppercase font-black tracking-widest text-muted" style={{ fontSize: 'var(--text-caption)' }}>
                      Widget PNG 캡처 중
                    </div>
                    <div className="font-bold text-main" style={{ fontSize: 'var(--text-small)' }}>
                      {Math.min(widgetCaptureProgress.index + 1, widgetCaptureProgress.total)} / {widgetCaptureProgress.total} · {widgetCaptureProgress.title}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 h-2 w-full rounded bg-[var(--surface-muted)] overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${Math.round((Math.min(widgetCaptureProgress.index + 1, widgetCaptureProgress.total) / widgetCaptureProgress.total) * 100)}%`,
                    backgroundColor: 'var(--primary-color)',
                  }}
                />
              </div>
              <div className="mt-2 text-[var(--text-muted)]" style={{ fontSize: 'var(--text-tiny)' }}>
                브라우저 다운로드가 뜰 때까지 잠시 기다려주세요.
              </div>
            </div>
          </div>
        </div>
      )}

      {isDesignDocsOpen && (
        <DesignDocs theme={theme} onClose={() => setIsDesignDocsOpen(false)} />
      )}

      <WidgetPicker
        isOpen={isWidgetPickerOpen}
        onClose={() => setIsWidgetPickerOpen(false)}
        onSelect={addWidgetWithType}
        isDark={theme.mode === 'dark'}
      />

      {user && (
        <FloatingAssistantButton 
          isPreview={isPreviewMode}
          onClick={isPreviewMode ? () => setIsPreviewMode(false) : () => setIsFloatingGnbOpen(!isFloatingGnbOpen)} 
        />
      )}
      {/* ── 내보내기 진행 중 로딩 오버레이 ── */}
      {exportPhase && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center animate-in fade-in duration-300"
          style={{
            zIndex: 'var(--export-overlay-z-index)',
            backgroundColor: 'var(--export-overlay-backdrop-bg)',
            backdropFilter: `blur(var(--export-overlay-backdrop-blur))`,
            WebkitBackdropFilter: `blur(var(--export-overlay-backdrop-blur))`,
          }}
        >
          <div
            className="flex flex-col items-center border border-[var(--border-base)]"
            style={{
              backgroundColor: 'var(--surface)',
              padding: 'var(--spacing-xl)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-premium)',
              gap: 'var(--spacing-lg)',
              maxWidth: 'var(--export-overlay-dialog-max-width)',
              width: '100%',
              margin: '0 var(--spacing-md)',
            }}
          >
            <div
              className="relative"
              style={{ width: 'var(--export-overlay-spinner-size)', height: 'var(--export-overlay-spinner-size)' }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{ border: 'var(--export-overlay-spinner-border) solid var(--primary-20)' }}
              />
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  border: 'var(--export-overlay-spinner-border) solid var(--primary-color)',
                  borderTopColor: 'transparent',
                }}
              />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-main" style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--spacing-xs)' }}>
                {exportPhase === 'waiting' && "준비 중..."}
                {exportPhase === 'capturing' && "화면 캡처 중..."}
                {exportPhase === 'packing' && "데이터 압축 중..."}
              </h3>
              <p className="text-muted" style={{ fontSize: 'var(--text-small)' }}>
                잠시만 기다려주세요. 대시보드를 파일로 만들고 있습니다.
              </p>
            </div>

            <div
              className="w-full rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--surface-elevated)', height: 'var(--export-overlay-progress-height)' }}
            >
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  width: exportPhase === 'waiting' ? '33%' : exportPhase === 'capturing' ? '66%' : '95%',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
