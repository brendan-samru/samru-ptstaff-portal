'use client';

import { useState, useEffect } from 'react';
import { Card, updateCardDetails } from '@/lib/portal/cards';
import { Loader2, X } from 'lucide-react';
import { QuillField } from '@/components/QuillField';

type EditCardModalProps = {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
  card: Card | null;
  orgId: string;
};

export function EditCardModal({ open, onClose, onRefresh, card, orgId }: EditCardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  // When the 'card' prop changes, fill the form
  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
    }
  }, [card]);

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
    ],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;

    setIsBusy(true);
    try {
  
  // Check for empty HTML
  const finalDescription = (description === '<p><br></p>' || description === '') ? null : description;
  await updateCardDetails(orgId, card.id, { title, description: finalDescription });
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Failed to update card:", error);
      alert("Error: Could not update card.");
    } finally {
      setIsBusy(false);
    }
  };

  if (!open || !card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Edit Card Details</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="cardTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Card Title
              </label>
              <input
                id="cardTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Description
              </label>
              <QuillField
                value={description}
                onChange={setDescription}
                modules={quillModules}
                placeholder="Description (optional)"
              />
            </div>
          </div>
          <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md flex items-center gap-2"
            >
              {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}