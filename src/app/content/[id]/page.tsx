'use client';

import { useState } from 'react';
import { ArrowLeft, Download, Eye, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Mock data - replace with actual data fetching
const mockContent = {
  1: {
    id: 1,
    category: 'training',
    title: 'New Staff Onboarding Guide',
    description: 'Complete orientation materials for new SAMRU team members covering policies, procedures, systems access, and organizational culture.',
    image: '/api/placeholder/800/600',
    updated: 'Oct 15, 2025',
    type: 'pdf',
    fileUrl: '/files/onboarding-guide.pdf',
    views: 245,
    fileSize: '2.3 MB'
  },
  5: {
    id: 5,
    category: 'training',
    title: 'Customer Service Excellence',
    description: 'Best practices for supporting MRU students with empathy, professionalism, and effectiveness.',
    image: '/api/placeholder/800/600',
    updated: 'Oct 1, 2025',
    type: 'video',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    localVideoUrl: '/videos/customer-service.mp4',
    views: 189,
    duration: '12:34'
  }
};

export default function ContentDetail() {
  const params = useParams();
  const contentId = params?.id as string;
  const content = mockContent[contentId as keyof typeof mockContent];

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
            Content not found
          </h1>
          <Link href="/" className="text-[#26A9E0] hover:underline" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            Return to portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            <span style={{ fontFamily: 'Quicksand, sans-serif' }}>Back to Portal</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[#8BC53F]/20 text-[#65953B] rounded-full text-sm font-medium" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              {content.category.replace('-', ' & ').toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium uppercase" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              {content.type}
            </span>
          </div>
          
          <h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Ubuntu, sans-serif' }}
          >
            {content.title}
          </h1>
          
          <p 
            className="text-xl text-gray-600 mb-6"
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            {content.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Updated {content.updated}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{content.views} views</span>
            </div>
            {content.fileSize && (
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>{content.fileSize}</span>
              </div>
            )}
            {content.duration && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>{content.duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Display */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Video Content */}
          {content.type === 'video' && (
            <div className="aspect-video bg-black">
              {content.videoUrl ? (
                // Embedded video (YouTube/Vimeo)
                <iframe
                  src={content.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : content.localVideoUrl ? (
                // Local video with HTML5 player
                <video
                  controls
                  className="w-full h-full"
                  poster={content.image}
                >
                  <source src={content.localVideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  Video not available
                </div>
              )}
            </div>
          )}

          {/* PDF Content */}
          {content.type === 'pdf' && (
            <div className="h-[800px]">
              <iframe
                src={content.fileUrl}
                className="w-full h-full"
                title={content.title}
              />
            </div>
          )}

          {/* PowerPoint Content */}
          {content.type === 'ppt' && (
            <div className="h-[800px]">
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(content.fileUrl || '')}`}
                className="w-full h-full"
                title={content.title}
              />
            </div>
          )}

          {/* Image Content */}
          {content.type === 'image' && (
            <div className="p-8 flex items-center justify-center bg-gray-50">
              <img
                src={content.image}
                alt={content.title}
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {content.fileUrl && (
            <a
              href={content.fileUrl}
              download
              className="flex-1 px-6 py-3 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors font-medium text-center flex items-center justify-center gap-2"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              <Download className="w-5 h-5" />
              Download File
            </a>
          )}
          <Link
            href="/"
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            Back to Portal
          </Link>
        </div>

        {/* Additional Info Section */}
        <div className="mt-12 bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-lg">
          <h2 
            className="text-2xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Ubuntu, sans-serif' }}
          >
            About This Resource
          </h2>
          <p 
            className="text-gray-600 leading-relaxed"
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            {content.description}
          </p>
          
          {/* Related Content - Placeholder */}
          <div className="mt-8">
            <h3 
              className="text-lg font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Ubuntu, sans-serif' }}
            >
              Related Resources
            </h3>
            <p 
              className="text-gray-600 text-sm"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              More resources coming soon...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
