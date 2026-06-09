import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader } from 'lucide-react';
import { uploadFile } from '../api/client';

/**
 * FileUpload – drag-and-drop or click-to-select file upload for CSV/JSON files.
 *
 * Props:
 *  - onUploadComplete : (result) => void  – called after a successful upload
 */
export default function FileUpload({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
  const inputRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
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
    if (err) {
      showToast('error', err);
      return;
    }
    setSelectedFile(file);
    setToast(null);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

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
    if (!selectedFile) return;
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadFile(selectedFile, setProgress);
      showToast('success', result.message || `File uploaded — ${result.chunksCreated} chunks indexed.`);
      setSelectedFile(null);
      setProgress(0);
      if (onUploadComplete) onUploadComplete(result);
    } catch (err) {
      showToast('error', err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setToast(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-900/20'
            : selectedFile
              ? 'border-green-600/50 bg-green-900/10'
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
            <FileText size={16} className="text-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-green-300 text-xs font-medium truncate">{selectedFile.name}</p>
              <p className="text-gray-500 text-xs">{formatSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="text-gray-500 hover:text-gray-300 flex-shrink-0"
              aria-label="Remove selected file"
            >
              <X size={14} />
            </button>
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
            <span>Uploading & indexing…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload button */}
      {selectedFile && !uploading && (
        <button
          onClick={handleUpload}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Upload size={13} />
          Upload &amp; Index
        </button>
      )}

      {/* Uploading spinner */}
      {uploading && (
        <div className="mt-2 flex items-center justify-center gap-2 text-blue-400 text-xs">
          <Loader size={13} className="animate-spin" />
          Processing… (this may take a moment)
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
            : <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          }
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
