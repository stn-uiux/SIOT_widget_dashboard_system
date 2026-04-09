
import React, { useRef, useState } from 'react';
import { X, FileSpreadsheet, Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Widget } from '../types';

interface ExcelModalProps {
  widget: Widget | null;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (id: string, newData: any[]) => void;
  isDark: boolean;
}

const ExcelModal: React.FC<ExcelModalProps> = ({ widget, isOpen, onClose, onUpload, isDark }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !widget) return null;

  const downloadSample = () => {
    const xAxis = widget.config.xAxisKey || 'name';
    const xAxisLabel = widget.config.xAxisLabel || xAxis;
    const seriesKeys = widget.config.series?.map((s) => s.key) || [];
    const seriesLabels = widget.config.series?.map((s) => s.label) || [];

    // Sample data rows
    const dataRows = widget.data.length > 0 ? widget.data : [
      { [xAxis]: 'Item 1', ...seriesKeys.reduce((acc, k) => ({...acc, [k]: 100}), {}) }
    ];

    // Map internal keys to user-facing labels for the Excel file
    const exportData = dataRows.map(row => {
      const newRow: any = { [xAxisLabel]: row[xAxis] };
      widget.config.series?.forEach(s => {
        newRow[s.label] = row[s.key];
      });
      return newRow;
    });

    const headers = [xAxisLabel, ...seriesLabels];
    const ws = XLSX.utils.json_to_sheet(exportData, { header: headers });
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${widget.title.replace(/\s+/g, '_')}_Template.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data && Array.isArray(data) && data.length > 0) {
          onUpload(widget.id, data);
          setStatus('success');
          setTimeout(onClose, 1500);
        } else {
          throw new Error("Invalid or empty data format");
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('Failed to parse Excel file. Please use the template format.');
      }
    };
    reader.onerror = () => {
      setStatus('error');
      setErrorMessage('Error reading file');
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`relative w-full max-w-sm rounded-[var(--radius-modal)] shadow-[var(--modal-shadow)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 bg-[var(--modal-bg)] border border-[var(--modal-border)] backdrop-blur-xl`}>
        <div className="flex items-center justify-between p-6 border-b border-[var(--modal-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-500/10 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="font-black text-lg tracking-tight text-main">Excel Import</h2>
              <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Update widget data</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--black-alpha-05)] dark:hover:bg-[var(--white-alpha-10)] rounded-full text-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted leading-relaxed">
              Download the current data as a template, modify the values, and upload it back to see the changes.
            </p>
            
            <button 
              onClick={downloadSample}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary-color)] font-bold text-xs uppercase tracking-widest border border-[var(--primary-5)]/20 hover:brightness-110 transition-all shadow-sm"
            >
              <Download size={16} /> Download Excel Template
            </button>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
              status === 'success' ? 'border-green-500 bg-green-500/5' :
              status === 'error' ? 'border-red-500 bg-red-500/5' :
              'border-[var(--modal-border)] hover:border-[var(--primary-color)] bg-[var(--modal-card-bg)] hover:bg-[var(--primary-subtle)]/5'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
            />
            
            {status === 'idle' && (
              <>
                <div className="w-14 h-14 rounded-full bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary-color)] shadow-inner">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-main">Click to upload Excel</p>
                  <p className="text-[10px] text-muted mt-1 font-medium">Supports .xlsx, .xls, .csv</p>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="w-14 h-14 text-green-500 animate-bounce" />
                <p className="text-green-500 font-black text-lg tracking-tight">Successfully Updated!</p>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="w-14 h-14 text-red-500" />
                <p className="text-red-500 font-bold text-center text-xs px-4">{errorMessage}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setStatus('idle'); }} 
                  className="mt-2 text-[10px] underline text-muted uppercase font-black tracking-widest"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-4 bg-[var(--modal-sidebar-bg)] border-t border-[var(--modal-border)] text-[9px] text-muted text-center italic font-medium opacity-80">
          Ensure column headers match the template format for correct data mapping.
        </div>
      </div>
    </div>
  );
};

export default ExcelModal;
