'use client';

import { Card } from '@/lib/portal/cards';
import { FileText } from 'lucide-react';

// This component defines what each card in the grid looks like
export function PortalCard({ card }: { card: Card }) {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      {/* Card Image */}
      <div className="w-full h-40 bg-gray-200">
        {card.heroImage ? (
          <img 
            src={card.heroImage} 
            alt={card.title || 'Card image'} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <FileText size={40} />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1">
        <h3 className="font-bold text-lg text-gray-900 truncate">
          {card.title || 'Untitled Card'}
        </h3>
        {card.description && (
          <div 
            className="text-sm text-gray-600 mt-1 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: card.description }} 
          />
        )}
      </div>

      {/* Card Footer (e.g., a "View" button) */}
      {/* We can make this a link later */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <span className="text-sm font-medium text-blue-600">
          View Content
        </span>
      </div>
    </div>
  );
}