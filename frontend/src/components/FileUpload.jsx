import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader, Sparkles } from 'lucide-react';
import { uploadAndAnalyzeFile } from '../api/client';

export default function FileUpload({ sessionId, onUploadComplete, onAnalysisComplete }) {
  const [isDragging, setIsDragging]     = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading]       = useState(false);
  const [progress, setProgress]         = useState(0);
  const [status, setStatus]             = useState('idle');
  const [toast, setToast]               = useState(null);
  const inputRef = useRef(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

  const validate = (file) => {
    if (!file) return 'No file selected.';
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'json'].includes(ext)) return 'Only .csv and .json files accepted.';
    if (file.size > 10 * 1024 * 1024) return 'File must be under 10 MB.';
    return null;
  };

  const pickFile = (file) => {
    const err = validate(file);
    if (err) { showToast('error', err); return; }
    setSelectedFile(file); setToast(null); setStatus('idle');
  };

  const handleDragOver  = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0]; if (f) pickFile(f);
  }, []); // eslint-disable-line

  const handleInput = (e) => { const f = e.target.files[0]; if (f) pickFile(f); e.target.value = ''; };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;
    setUploading(true); setProgress(0); setStatus('uploading');
    try {
      const result = await uploadAndAnalyzeFile(selectedFile, sessionId, (pct) => {
        setProgress(pct);
        if (pct >= 100) setStatus('analyzing');
      });
      setStatus('done');
      showToast('success', `"${selectedFile.name}" analysed ✓`);
      if (onUploadComplete) onUploadComplete(result);
      if (onAnalysisComplete) onAnalysisComplete({
        userMessage: result.userMessage,
        results:     result.results || [],
        analysis:    result.analysis,
        agentUsed:   result.agentUsed || 'File Analysis Agent',
      });
      setSelectedFile(null); setProgress(0);
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setStatus('error');
      showToast('error', err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const fmt = (b) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;

  const statusLabel = { uploading: 'Uploading…', analyzing: 'Running prompts…', done: 'Done!', error: 'Failed', idle: '' }[status];

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        className="relative rounded-xl p-4 text-center cursor-pointer transition-all duration-200 border-2 border-dashed"
        style={{
          borderColor: isDragging ? '#7c3aed' : selectedFile ? 'rgba(124,58,237,0.4)' : '#2a2a35',
          background: isDragging ? 'rgba(124,58,237,0.08)' : selectedFile ? 'rgba(124,58,237,0.05)' : '#1c1c22',
        }}
        onClick={() => !selectedFile && inputRef.current?.click()}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        role="button" tabIndex={0}
        aria-label="Drop CSV or JSON file here"
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}>
        <input ref={inputRef} type="file" accept=".csv,.json" className="hidden" onChange={handleInput} aria-hidden="true" />

        {selectedFile ? (
          <div className="flex items-center gap-2">
            <FileText size={15} style={{ color: '#a78bfa', flexShrink: 0 }} />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium truncate" style={{ color: '#c4b5fd' }}>{selectedFile.name}</p>
              <p className="text-xs" style={{ color: '#3d3a52' }}>{fmt(selectedFile.size)}</p>
            </div>
            {!uploading && (
              <button onClick={e => { e.stopPropagation(); setSelectedFile(null); setToast(null); setStatus('idle'); }}
                aria-label="Remove" style={{ color: '#3d3a52', flexShrink: 0 }}>
                <X size={13} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-1">
            <Upload size={17} style={{ color: isDragging ? '#a78bfa' : '#3d3a52' }} />
            <p className="text-xs" style={{ color: '#6e6b88' }}>{isDragging ? 'Drop here' : 'Drop CSV or JSON'}</p>
            <p className="text-xs" style={{ color: '#3d3a52' }}>or click to browse</p>
          </div>
        )}
      </div>

      {/* Progress */}
      {uploading && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1" style={{ color: '#6e6b88' }}>
            <span>{statusLabel}</span>
            {status === 'uploading' && <span>{progress}%</span>}
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1c1c22' }}>
            {status === 'analyzing'
              ? <div className="h-full rounded-full animate-pulse" style={{ background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', width: '100%' }} />
              : <div className="h-full rounded-full transition-all duration-300" style={{ background: 'linear-gradient(90deg,#7c3aed,#6d28d9)', width: `${progress}%` }} />}
          </div>
        </div>
      )}

      {/* Upload button */}
      {selectedFile && !uploading && (
        <button onClick={handleUpload}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold btn-primary">
          <Sparkles size={12} />
          Upload &amp; Analyse
        </button>
      )}

      {/* Spinner */}
      {uploading && (
        <div className="mt-2 flex items-center justify-center gap-2 text-xs" style={{ color: '#a78bfa' }}>
          <Loader size={12} className="animate-spin" />
          {status === 'analyzing' ? 'Running prompts through agent…' : 'Uploading & indexing…'}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg text-xs border"
             style={toast.type === 'success'
               ? { background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)', color: '#6ee7b7' }
               : { background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>
          {toast.type === 'success'
            ? <CheckCircle size={12} className="flex-shrink-0 mt-0.5" />
            : <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
