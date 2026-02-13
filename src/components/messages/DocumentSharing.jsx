import React, { useState, useRef } from 'react';
import { X, Upload, File, FileText, FileSpreadsheet, Image } from 'lucide-react';
import Button from '../common/Button';

const DocumentSharing = ({ onClose, onShare }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const fileInputRef = useRef();

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setName(f.name);
    }
  };

  const getIcon = () => {
    if (!file) return <File size={24} />;
    if (file.type.startsWith('image/')) return <Image size={24} />;
    if (file.type.includes('pdf')) return <FileText size={24} />;
    if (file.type.includes('sheet') || file.type.includes('excel')) return <FileSpreadsheet size={24} />;
    return <File size={24} />;
  };

  const handleShare = () => {
    if (file) {
      onShare({ name: name || file.name, file });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-bold">Share Document</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-display font-semibold text-sm mb-2">Document Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Financial Projections"
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-display font-semibold text-sm mb-2">File</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            {!file ? (
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full p-8 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary flex flex-col items-center gap-2"
              >
                <Upload size={32} className="text-neutral-400" />
                <span className="text-sm text-neutral-600">Click to upload</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                {getIcon()}
                <span className="flex-1 truncate text-sm">{file.name}</span>
                <button
                  onClick={() => setFile(null)}
                  className="p-1 hover:bg-neutral-200 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleShare} disabled={!file}>
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSharing;