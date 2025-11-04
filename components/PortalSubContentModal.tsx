'use client';

import { useState, useEffect } from 'react';
import { Card, SubCard, listSubContent } from '@/lib/portal/cards';
import { SubContentItem } from './SubContentItem'; // Import the component from Step 1
import { Loader2, X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  card: Card | null;
  orgId: string;
};

export function PortalSubContentModal({ open, onClose, card, orgId }: ModalProps) {
  const [subContent, setSubContent] = useState<SubCard[]>([]);
  const [loading, setLoading] = useState(false);

  // Load sub-content when the modal is opened
  useEffect(() => {
    if (open && card) {
      setLoading(true);
      listSubContent(orgId, card.id)
        .then(setSubContent)
        .catch(err => console.error("Failed to load sub-content:", err))
        .finally(() => setLoading(false));
    } else {
      // Clear content when modal is closed
      setSubContent([]);
    }
  }, [open, card, orgId]);

  if (!open || !card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 border-b">
          <div>
            <h3 className="text-xl font-semibold">{card.title}</h3>
            {card.description && (
              <div 
                className="text-sm text-gray-600 mt-1"
                dangerouslySetInnerHTML={{ __html: card.description }}
              />
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {loading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          )}
          {!loading && subContent.length === 0 && (
            <p className="text-center text-gray-500 py-10">No content found for this card.</p>
          )}
          {!loading && subContent.map(item => (
            <SubContentItem key={item.id} subCard={item} />
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}