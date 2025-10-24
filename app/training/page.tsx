'use client';

import { useState } from 'react';
import { ArrowLeft, Play, FileText } from 'lucide-react';
import Link from 'next/link';

// Mock training content
const trainingItems = [
  {
    id: 1,
    title: 'New Staff Onboarding',
    description: 'Complete orientation for new SAMRU team members',
    thumbnail: '/api/placeholder/400/300',
    type: 'video',
    duration: '15:30',
    enabled: true
  },
  {
    id: 2,
    title: 'Customer Service Excellence',
    description: 'Best practices for supporting MRU students',
    thumbnail: '/api/placeholder/400/300',
    type: 'video',
    duration: '12:45',
    enabled: true
  },
  {
    id: 3,
    title: 'Workplace Safety Training',
    description: 'Essential safety protocols and procedures',
    thumbnail: '/api/placeholder/400/300',
    type: 'video',
    duration: '18:20',
    enabled: true
  },
  {
    id: 4,
    title: 'Training Manual 2025',
    description: 'Comprehensive training documentation',
    thumbnail: '/api/placeholder/400/300',
    type: 'pdf',
    pages: 45,
    enabled: true
  },
  {
    id: 5,
    title: 'Leadership Development',
    description: 'Building effective leadership skills',
    thumbnail: '/api/placeholder/400/300',
    type: 'video',
    duration: '22:15',
    enabled: true
  },
  {
    id: 6,
    title: 'Quick Reference Guide',
    description: 'Essential procedures at a glance',
    thumbnail: '/api/placeholder/400/300',
    type: 'pdf',
    pages: 12,
    enabled: false
  }
];

export default function TrainingPage() {
  const [filter, setFilter] = useState<'all' | 'video' | 'pdf'>('all');

  const filteredItems = trainingItems.filter(item => {
    if (!item.enabled) return false; // Only show enabled items to regular users
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div className="min-h-screen">
      {/* Bubble Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/80 via-blue-100/60 to-white" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8BC53F]/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#26A9E0]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#65953B]/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors w-fit"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#8BC53F] to-[#65953B] rounded-2xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 
              className="text-4xl md:text-5xl font-bold text-gray-900"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Training & Presentations
            </h1>
          </div>
        </div>
        <p 
          className="text-lg text-gray-600 max-w-3xl"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Watch training videos, review presentations, and access learning materials to develop your skills.
        </p>
      </section>

      {/* Filter Pills */}
      <section className="max-w-7xl mx-auto px-6 pb-8">
        <div className="flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
              filter === 'video'
                ? 'bg-[#3B82F6] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Play className="w-4 h-4" />
            Videos
          </button>
          <button
            onClick={() => setFilter('pdf')}
            className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
              filter === 'pdf'
                ? 'bg-[#EF4444] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <FileText className="w-4 h-4" />
            PDFs
          </button>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={`/training/${item.id}`}
              className="group"
            >
              <div className="
                bg-white rounded-2xl overflow-hidden
                shadow-md hover:shadow-2xl
                transform hover:-translate-y-2
                transition-all duration-300
                border border-gray-100
              ">
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Type Badge - Color Coded */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white uppercase ${
                    item.type === 'video' ? 'bg-[#3B82F6]' : 'bg-[#EF4444]'
                  }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item.type}
                  </div>

                  {/* Play Icon Overlay for Videos */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-[#3B82F6] ml-1" fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 
                    className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#26A9E0] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {item.title}
                  </h3>
                  <p 
                    className="text-gray-600 text-sm mb-4 line-clamp-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {item.description}
                  </p>
                  
                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span style={{ fontFamily: 'Inter, sans-serif' }}>
                      {item.type === 'video' ? item.duration : `${item.pages} pages`}
                    </span>
                    <span className="text-[#26A9E0] font-medium group-hover:underline">
                      View →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 
              className="text-xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              No content found
            </h3>
            <p 
              className="text-gray-600"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Try selecting a different filter
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
