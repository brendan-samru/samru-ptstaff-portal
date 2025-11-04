'use client';

import { SubCard } from '@/lib/portal/cards';
import { FileText, ImageOff, Video, File, Presentation, FileSpreadsheet } from 'lucide-react';

// This is a view-only component for the portal
export function SubContentItem({ subCard }: { subCard: SubCard }) {
  
  // Render a Subcard
  if (subCard.type === 'subcard') {
    return (
      <div className="flex items-start gap-3 p-3 bg-gray-100 rounded-lg">
        <div className="w-24 h-18 bg-gray-300 rounded-md overflow-hidden flex-shrink-0" style={{ aspectRatio: '4/3' }}>
          {subCard.heroImage ? (
            <img src={subCard.heroImage} alt={subCard.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center">
              <ImageOff className="w-5 h-5 text-gray-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 truncate">{subCard.title}</h4>
          {/* Renders the formatted HTML description */}
          {subCard.description && (
            <div 
              className="text-sm text-gray-600 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: subCard.description }}
            />
          )}
        </div>
      </div>
    );
  }

  // Render a File
  if (subCard.type === 'file') {
    let Icon = File;
    if (subCard.fileType === 'pdf') Icon = FileText;
    if (subCard.fileType === 'video') Icon = Video;
    if (subCard.fileType === 'ppt') Icon = Presentation;
    if (subCard.fileType === 'xls') Icon = FileSpreadsheet;

    return (
      <a 
        href={subCard.fileUrl || '#'} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <div className="w-16 h-12 bg-gray-300 rounded-md overflow-hidden flex-shrink-0" style={{ aspectRatio: '4/3' }}>
          {subCard.fileType === 'image' && subCard.fileUrl ? (
            <img src={subCard.fileUrl} alt={subCard.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center">
              <Icon className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <span className="font-medium text-blue-600 hover:underline truncate">
            {subCard.title}
          </span>
        </div>
      </a>
    );
  }
  return null;
}