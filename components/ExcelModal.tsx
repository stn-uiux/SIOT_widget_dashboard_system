
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
          const xAxis = widget.config.xAxisKey || 'name';
          const xAxisLabel = widget.config.xAxisLabel || xAxis;
          
          // Map user-facing labels back to internal keys
          const importedData = data.map((row: any) => {
            const newRow: any = { [xAxis]: row[xAxisLabel] !== undefined ? row[xAxisLabel] : row[xAxis] };
            widget.config.series?.forEach(s => {
              newRow[s.key] = row[s.label] !== undefined ? row[s.label] : row[s.key];
            });
            // Keep any other remaining properties just in case
            Object.keys(row).forEach(k => {
              if (k !== xAxisLabel && !widget.config.series?.some(s => s.label === k)) {
                newRow[k] = row[k];
              }
            });
            return newRow;
          });

          onUpload(widget.id, importedData);
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
      
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${
        isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Excel Import</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Update widget data</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Download the current data as a template, modify the values, and upload it back to see the changes.
            </p>
            
            <button 
              onClick={downloadSample}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
            >
              <Download size={18} /> Download Excel Template
            </button>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
              status === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' :
              status === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
              isDark ? 'border-gray-700 hover:border-blue-500 bg-gray-800/50' : 'border-gray-200 hover:border-blue-500 bg-gray-50'
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
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Click to upload Excel</p>
                  <p className="text-xs text-gray-500 mt-1">Supports .xlsx, .xls, .csv</p>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="text-green-500 font-bold">Successfully Updated!</p>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-red-500 font-bold text-center text-xs px-4">{errorMessage}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setStatus('idle'); }} 
                  className="text-[10px] underline text-gray-400 uppercase font-bold"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-[10px] text-gray-500 text-center italic">
          Ensure column headers match the template format for correct data mapping.
        </div>
      </div>
    </div>
  );
};

export default ExcelModal;
