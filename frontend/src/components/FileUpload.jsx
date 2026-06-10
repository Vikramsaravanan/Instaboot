import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader, Sparkles } from 'lucide-react';
import { uploadAndAnalyzeFile } from '../api/client';

/**
 * FileUpload – drag-and-drop or click-to-select file upload for CSV/JSON files.
 * After upload, automatically runs LLM analysis and injects it into the chat.
 *
 * Props:
 *  - sessionId          : string   — current chat session ID (required for analysis)
 *  - onUploadComplete   : (result) => void  — called after successful upload + index
 *  - onAnalysisComplete : ({ userMessage, analysis, agentUsed }) => void
 *                         — called with the LLM analysis to inject into chat
 */
export default function FileUpload({ sessionId, onUploadComplete, onAnalysisComplete }) {
  const [isDragging, setIsDragging]   = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading]     = useState(false);
  const [progress, setProgress]       = useState(0);
  const [status, setStatus]           = useState('idle'); // 'idle'|'uploading'|'analyzing'|'done'|'error'
  const [toast, setToast]             = useState(null);
  const inputRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const validateFile = (file) => {
    if (!file) return 'No file selected.';
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'json'].includes(ext)) return 'Only .csv and .json files are accepted.';
    if (file.size > 10 * 1024 * 1024) return 'File size must be under 10 MB.';
    return null;
  };

  const handleFileSelect = (file) => {
    const err = validateFile(file);
    if (err) { showToast('error', err); return; }
    setSelectedFile(file);
    setToast(null);
    setStatus('idle');
  };

  const handleDragOver  = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []); // eslint-disable-line

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setProgress(0);
    setStatus('uploading');

    try {
      // Phase 1: upload & index (progress tracked)
      const result = await uploadAndAnalyzeFile(
        selectedFile,
        sessionId,
        (pct) => {
          setProgress(pct);
          // Once file transfer is done, switch to "analyzing" status
          if (pct >= 100) setStatus('analyzing');
        }
      );

      setStatus('done');
      showToast('success', `"${selectedFile.name}" indexed & analyzed ✓`);

      // Notify sidebar to refresh document list
      if (onUploadComplete) onUploadComplete(result);

      // Inject upload message + every prompt/response pair into the chat
      if (onAnalysisComplete) {
        onAnalysisComplete({
          userMessage: result.userMessage,
          results:     result.results || [],       // per-prompt detail
          analysis:    result.analysis,            // summary (fallback)
          agentUsed:   result.agentUsed || 'File Analysis Agent',
        });
      }

      setSelectedFile(null);
      setProgress(0);
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setStatus('error');
      showToast('error', err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setToast(null);
    setStatus('idle');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const statusLabel = {
    uploading: 'Uploading & indexing…',
    analyzing: 'Running prompts through agent…',
    done:      'Done!',
    error:     'Upload failed',
    idle:      '',
  }[status];

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-900/20'
            : selectedFile
              ? 'border-blue-600/50 bg-blue-900/10'
              : 'border-gray-600 hover:border-gray-500 bg-gray-800/30 hover:bg-gray-800/50'
        }`}
        onClick={() => !selectedFile && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Drop zone for CSV and JSON files"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json"
          className="hidden"
          onChange={handleInputChange}
          aria-hidden="true"
        />

        {selectedFile ? (
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-blue-400 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-blue-300 text-xs font-medium truncate">{selectedFile.name}</p>
              <p className="text-gray-500 text-xs">{formatSize(selectedFile.size)}</p>
            </div>
            {!uploading && (
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="text-gray-500 hover:text-gray-300 flex-shrink-0"
                aria-label="Remove selected file"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-1">
            <Upload size={18} className={`${isDragging ? 'text-blue-400' : 'text-gray-500'} transition-colors`} />
            <p className="text-gray-400 text-xs">
              {isDragging ? 'Drop here' : 'Drop CSV or JSON'}
            </p>
            <p className="text-gray-600 text-xs">or click to browse</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{statusLabel}</span>
            {status === 'uploading' && <span>{progress}%</span>}
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            {status === 'analyzing' ? (
              /* Indeterminate progress bar while LLM is running */
              <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full animate-pulse w-full" />
            ) : (
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
        </div>
      )}

      {/* Upload button */}
      {selectedFile && !uploading && (
        <button
          onClick={handleUpload}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Sparkles size={13} />
          Upload &amp; Analyse
        </button>
      )}

          {uploading && (
            <div className="mt-2 flex items-center justify-center gap-2 text-blue-400 text-xs">
              <Loader size={13} className="animate-spin" />
              {status === 'analyzing' ? 'Running prompts through agent…' : 'Uploading & indexing…'}
            </div>
          )}

      {/* Toast */}
      {toast && (
        <div className={`mt-2 flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
          toast.type === 'success'
            ? 'bg-green-900/40 border border-green-700/50 text-green-300'
            : 'bg-red-900/40 border border-red-700/50 text-red-300'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle size={13} className="flex-shrink-0 mt-0.5" />
            : <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
