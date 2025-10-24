'use client';

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete: (url: string, fileName: string, fileType: string) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
  storagePath?: string;
}

export function FileUpload({ 
  onUploadComplete, 
  acceptedTypes = "video/*,application/pdf,.doc,.docx,.ppt,.pptx",
  maxSizeMB = 100,
  storagePath = 'uploads'
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size
    const sizeMB = selectedFile.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Create unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;
      const storageRef = ref(storage, `${storagePath}/${fileName}`);

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(progress));
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Upload failed. Please try again.');
          setUploading(false);
        },
        async () => {
          // Upload complete
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setSuccess(true);
          setUploading(false);
          
          // Determine file type
          const fileType = file.type.startsWith('video/') ? 'video' 
            : file.type === 'application/pdf' ? 'pdf' 
            : 'document';
          
          onUploadComplete(downloadURL, file.name, fileType);
          
          // Reset after 2 seconds
          setTimeout(() => {
            setFile(null);
            setSuccess(false);
            setProgress(0);
          }, 2000);
        }
      );
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setProgress(0);
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      {!file && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#26A9E0] transition-colors">
          <input
            type="file"
            onChange={handleFileSelect}
            accept={acceptedTypes}
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
                Videos, PDFs, Documents (max {maxSizeMB}MB)
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Selected File */}
      {file && !success && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-[#8BC53F] rounded-lg flex items-center justify-center flex-shrink-0">
                <File className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!uploading && (
              <button
                onClick={handleRemove}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm font-medium text-[#26A9E0]">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#26A9E0] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Button */}
          {!uploading && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-[#8BC53F] text-white py-2 px-4 rounded-lg hover:bg-[#65953B] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload File
            </button>
          )}

          {/* Uploading State */}
          {uploading && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="w-5 h-5 text-[#26A9E0] animate-spin" />
              <span className="text-gray-600">Uploading...</span>
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Upload successful!</p>
            <p className="text-sm text-green-700">File has been uploaded</p>
          </div>
        </div>
      )}
    </div>
  );
}
