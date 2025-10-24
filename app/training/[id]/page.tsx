'use client';

import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, Download, Play } from 'lucide-react';
import Link from 'next/link';

// Mock content data - in real app, fetch from database based on ID
const mockContent: { [key: string]: any } = {
  '1': {
    title: 'New Staff Onboarding',
    description: 'Welcome to SAMRU! This comprehensive orientation will guide you through everything you need to know as a new team member.',
    category: 'Training & Presentations',
    type: 'video',
    thumbnail: '/api/placeholder/800/450',
    files: [
      { name: 'Part 1: Welcome & Introduction', type: 'video', duration: '5:30', url: '#' },
      { name: 'Part 2: SAMRU Policies & Procedures', type: 'video', duration: '8:45', url: '#' },
      { name: 'Part 3: Campus Tour', type: 'video', duration: '6:15', url: '#' },
    ],
    updatedAt: 'October 15, 2025'
  },
  '2': {
    title: 'Customer Service Excellence',
    description: 'Learn best practices for supporting MRU students with empathy, professionalism, and effectiveness.',
    category: 'Training & Presentations',
    type: 'video',
    thumbnail: '/api/placeholder/800/450',
    files: [
      { name: 'Customer Service Training', type: 'video', duration: '12:45', url: '#' },
    ],
    updatedAt: 'October 10, 2025'
  },
  '4': {
    title: 'Training Manual 2025',
    description: 'Comprehensive documentation covering all training protocols, procedures, and best practices.',
    category: 'Training & Presentations',
    type: 'pdf',
    thumbnail: '/api/placeholder/800/450',
    files: [
      { name: 'Training Manual 2025 - Full Document', type: 'pdf', pages: 45, url: '#' },
    ],
    updatedAt: 'September 28, 2025'
  }
};

export default function ContentDetailPage() {
  const params = useParams();
  const contentId = params?.id as string;
  const content = mockContent[contentId];

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Not Found</h1>
          <Link href="/training" className="text-[#26A9E0] hover:underline">
            ← Back to Training
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Darker Bubble Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-200/90 via-blue-200/70 to-blue-100/80" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8BC53F]/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#26A9E0]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#65953B]/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link 
            href="/training"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors w-fit"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Training</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header Info */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase ${
              content.type === 'video' ? 'bg-[#3B82F6]' : 'bg-[#EF4444]'
            }`} style={{ fontFamily: 'Inter, sans-serif' }}>
              {content.type}
            </span>
            <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              {content.category}
            </span>
          </div>
          
          <h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {content.title}
          </h1>
          
          <p 
            className="text-lg text-gray-600 leading-relaxed mb-4"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {content.description}
          </p>

          <p className="text-sm text-gray-500">
            Last updated: {content.updatedAt}
          </p>
        </div>

        {/* Main Content Area */}
        {content.type === 'video' && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl mb-8">
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
              <img 
                src={content.thumbnail} 
                alt={content.title}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-[#3B82F6] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#2563EB] transition-colors shadow-2xl">
                  <Play className="w-10 h-10 text-white ml-1" fill="white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {content.type === 'pdf' && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl mb-8 p-12">
            <div className="text-center">
              <FileText className="w-24 h-24 text-[#EF4444] mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {content.files[0].name}
              </h3>
              <p className="text-gray-600 mb-6">
                {content.files[0].pages} pages
              </p>
              <button className="px-8 py-3 bg-[#EF4444] text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2 mx-auto">
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          </div>
        )}

        {/* Files List (if multiple) */}
        {content.files.length > 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 
              className="text-2xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Available Content
            </h2>
            
            <div className="space-y-3">
              {content.files.map((file: any, index: number) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      file.type === 'video' ? 'bg-[#3B82F6]' : 'bg-[#EF4444]'
                    }`}>
                      {file.type === 'video' ? (
                        <Play className="w-6 h-6 text-white" fill="white" />
                      ) : (
                        <FileText className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 
                        className="font-semibold text-gray-900"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {file.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {file.type === 'video' ? file.duration : `${file.pages} pages`}
                      </p>
                    </div>
                  </div>
                  
                  {file.type === 'pdf' && (
                    <button className="px-4 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Content (Optional) */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40">
          <h2 
            className="text-xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Need Help?
          </h2>
          <p className="text-gray-600 mb-4">
            If you have questions about this training material, please contact your manager or reach out to HR at hr@samru.ca
          </p>
          <Link 
            href="/training"
            className="text-[#26A9E0] hover:underline font-medium"
          >
            ← Back to all training materials
          </Link>
        </div>
      </div>
    </div>
  );
}
