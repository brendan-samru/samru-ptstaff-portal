'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Edit, Image as ImageIcon, FileText, Video, Check, X } from 'lucide-react';
import Link from 'next/link';

// Mock training cards that managers can toggle
const trainingCards = [
  {
    id: 1,
    title: 'New Staff Onboarding',
    description: 'Complete orientation for new SAMRU team members',
    category: 'training',
    type: 'video',
    enabled: true,
    thumbnail: '/api/placeholder/200/150',
    filesCount: 3
  },
  {
    id: 2,
    title: 'Customer Service Excellence',
    description: 'Best practices for supporting MRU students',
    category: 'training',
    type: 'video',
    enabled: true,
    thumbnail: '/api/placeholder/200/150',
    filesCount: 1
  },
  {
    id: 3,
    title: 'Workplace Safety Training',
    description: 'Essential safety protocols and procedures',
    category: 'health-safety',
    type: 'video',
    enabled: true,
    thumbnail: '/api/placeholder/200/150',
    filesCount: 5
  },
  {
    id: 4,
    title: 'Training Manual 2025',
    description: 'Comprehensive training documentation',
    category: 'training',
    type: 'pdf',
    enabled: true,
    thumbnail: '/api/placeholder/200/150',
    filesCount: 1
  },
  {
    id: 5,
    title: 'Leadership Development',
    description: 'Building effective leadership skills',
    category: 'training',
    type: 'video',
    enabled: true,
    thumbnail: '/api/placeholder/200/150',
    filesCount: 2
  },
  {
    id: 6,
    title: 'Quick Reference Guide',
    description: 'Essential procedures at a glance',
    category: 'resources',
    type: 'pdf',
    enabled: false,
    thumbnail: '/api/placeholder/200/150',
    filesCount: 1
  },
  {
    id: 7,
    title: 'Emergency Response Procedures',
    description: 'Critical safety and emergency protocols',
    category: 'health-safety',
    type: 'pdf',
    enabled: true,
    thumbnail: '/api/placeholder/200/150',
    filesCount: 4
  },
  {
    id: 8,
    title: 'Brand Guidelines 2025',
    description: 'Official SAMRU branding standards',
    category: 'resources',
    type: 'pdf',
    enabled: false,
    thumbnail: '/api/placeholder/200/150',
    filesCount: 1
  }
];

export default function AdminDashboard() {
  const [cards, setCards] = useState(trainingCards);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const toggleCard = (id: number) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, enabled: !card.enabled } : card
    ));
  };

  const filteredCards = filterCategory === 'all' 
    ? cards 
    : cards.filter(card => card.category === filterCategory);

  const stats = {
    total: cards.length,
    enabled: cards.filter(c => c.enabled).length,
    disabled: cards.filter(c => !c.enabled).length
  };

  return (
    <div className="min-h-screen">
      {/* Bubble Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/80 via-blue-100/60 to-white" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8BC53F]/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#26A9E0]/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Portal</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Content Manager
              </h1>
            </div>
            <button
              className="px-4 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors text-sm font-medium flex items-center gap-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Plus className="w-4 h-4" />
              Add New Card
            </button>
          </div>
          <p 
            className="text-gray-600 mt-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Manage content cards, edit details, and control what's visible to staff
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {stats.total}
            </div>
            <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Total Cards
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="text-3xl font-bold text-[#8BC53F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {stats.enabled}
            </div>
            <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Active Cards
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="text-3xl font-bold text-gray-400 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {stats.disabled}
            </div>
            <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Inactive Cards
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent outline-none"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <option value="all">All Categories</option>
            <option value="training">Training & Presentations</option>
            <option value="health-safety">Health & Safety</option>
            <option value="resources">Resources</option>
            <option value="handbooks">Handbooks</option>
          </select>
        </div>

        {/* Cards Checklist */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredCards.map((card) => (
              <div 
                key={card.id} 
                className={`p-6 transition-colors ${
                  card.enabled ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-6">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <button
                      onClick={() => toggleCard(card.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        card.enabled
                          ? 'bg-[#8BC53F] border-[#8BC53F]'
                          : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {card.enabled && <Check className="w-4 h-4 text-white" />}
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                      <img 
                        src={card.thumbnail} 
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 
                        className="text-lg font-bold text-gray-900"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {card.title}
                      </h3>
                      <div className="flex gap-2">
                        {/* Type Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase ${
                          card.type === 'video' ? 'bg-[#3B82F6]' : 'bg-[#EF4444]'
                        }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                          {card.type}
                        </span>
                      </div>
                    </div>
                    
                    <p 
                      className="text-gray-600 text-sm mb-3"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {card.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <FileText className="w-4 h-4" />
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>
                        {card.filesCount} {card.filesCount === 1 ? 'file' : 'files'} in folder
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Card
                      </button>
                      <button
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <ImageIcon className="w-4 h-4" />
                        Change Image
                      </button>
                      <button
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <FileText className="w-4 h-4" />
                        Manage Files
                      </button>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      card.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                      {card.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
