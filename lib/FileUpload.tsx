'use client';

import { useState, useEffect } from 'react';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  // This interface now includes onFileChange, which will fix your error
  onFileChange: (file: File | null, localPreviewUrl: string | null) => void;
  accept?: string;
  maxSizeMB?: number;
  // Prop to show an existing file's name when editing
  initialFileName?: string | null;
}

export function FileUpload({ 
  onFileChange, 
  accept = "image/*", // Defaulting to image/* as per your page
  maxSizeMB = 100,
  initialFileName = null,
}: FileUploadProps) {
  
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(initialFileName);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update internal name when initialFileName prop changes (for editing)
  useEffect(() => {
    if (!file) { // Only update if no new file is selected
      setFileName(initialFileName);
    }
  }, [initialFileName, file]);
  
  // Cleanup local preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }
    
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      onFileChange(null, null);
      return;
    }

    // Check file type
    if (accept && !selectedFile.type.match(accept.replace("*", ".*"))) {
      setError("Invalid file type.");
      onFileChange(null, null);
      return;
    }

    // Check file size
    const sizeMB = selectedFile.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      onFileChange(null, null);
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name); // Set the new file name
    setError(null);

    // Create local preview if it's an image
    if (selectedFile.type.startsWith('image/')) {
      const localUrl = URL.createObjectURL(selectedFile);
      setLocalPreview(localUrl);
      onFileChange(selectedFile, localUrl); // Pass file AND local URL
    } else {
      onFileChange(selectedFile, null); // Pass file but no preview
    }
  };

  const handleRemove = () => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }
    setFile(null);
    setFileName(null); // Clear the name
    setError(null);
    onFileChange(null, null); // Tell parent to clear
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      {!file && !fileName && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#26A9E0] transition-colors">
          <input
            type="file"
            onChange={handleFileSelect}
            accept={accept}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-700 font-medium mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                Images only (max {maxSizeMB}MB)
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Selected File */}
      {(file || fileName) && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-[#8BC53F] rounded-lg flex items-center justify-center flex-shrink-0">
                <File className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{fileName}</p>
                {file && ( // Only show size for newly selected files
                  <p className="text-sm text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}