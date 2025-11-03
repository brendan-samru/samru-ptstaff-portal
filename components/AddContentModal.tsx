"use client";
import { useRef, useState } from "react";
import { Card, createSubCard, uploadToCard } from "@/lib/portal/cards";
import { FileText, Loader2, Plus, Upload, X } from "lucide-react";
import { EditorField } from '@/components/EditorField';


export function AddContentModal({
  orgId,
  cardId,
  open,
  onClose,
  onRefresh,
}: {
  orgId: string;
  cardId: string | null;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<"file" | "subcard">("file");
  const [busy, setBusy] = useState(false);
  
  // State for File Upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for Subcard Form
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  if (!open || !cardId) return null;

  const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
  ],
};

  const handleClose = () => {
    // Reset all form fields
    setTitle("");
    setDescription("");
    setImageFile(null);
    setBusy(false);
    onClose();
  };

  // --- Logic for Tab 1: Add File ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await uploadToCard(orgId, cardId, file);
      onRefresh(); // Refresh the parent list
      handleClose(); // Close modal on success
    } catch (error) {
      console.error("File upload failed:", error);
      alert("File upload failed. Please try again.");
      setBusy(false);
    }
    if (e.target) e.target.value = ""; // reset input
  };

  // --- Logic for Tab 2: Add Subcard ---
  const handleSubcardImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const handleSaveSubcard = async () => {
    if (!title) {
      alert("Please enter a title for the subcard.");
      return;
    }
    setBusy(true);
    try {
      await createSubCard(
        orgId, 
        cardId, 
        { 
            title, 
            description: description === '' ? null : description
        }, 
        imageFile
    );
      onRefresh(); // Refresh the parent list
      handleClose(); // Close modal on success
    } catch (error) {
      console.error("Failed to create subcard:", error);
      alert("Failed to create subcard. Please try again.");
      setBusy(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      {/* Hidden file input for "Add File" */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="application/pdf,image/*,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,video/*"
      />

      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl relative">
        {busy && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="mt-2 text-sm text-gray-600">Saving...</p>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add Content</h2>
          <button 
            className="text-gray-400 hover:text-gray-600" 
            onClick={handleClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button 
            className={`px-4 py-2 text-sm font-semibold ${tab === 'file' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setTab('file')}
          >
            Add File (PDF, Video, etc.)
          </button>
          <button 
            className={`px-4 py-2 text-sm font-semibold ${tab === 'subcard' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setTab('subcard')}
          >
            Add Subcard
          </button>
        </div>

        {/* Tab 1: Add File Panel */}
        <div className={tab === 'file' ? 'block' : 'hidden'}>
          <p className="text-sm text-gray-600 mb-4">
            Upload a single file (PDF, Word, video, image, etc.) to this card. This file will appear in the content list.
          </p>
          <button
            className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-5 h-5" />
            Choose File to Upload
          </button>
        </div>

        {/* Tab 2: Add Subcard Panel */}
        <div className={tab === 'subcard' ? 'block' : 'hidden'}>
          <p className="text-sm text-gray-600 mb-4">
            Create a new sub-card with its own title, description, and image. This is good for organizing content into categories.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Presentation Slides"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <EditorField
                value={description}
                onChange={setDescription}
                placeholder="Description (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image (4:3 ratio, optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleSubcardImageChange}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              onClick={handleSaveSubcard}
            >
              <Plus className="w-5 h-5" />
              Save Subcard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function setImage(file: File) {
  throw new Error("Function not implemented.");
}
