'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Edit, Image as ImageIcon, FileText, X, Upload, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Types
interface ContentCard {
  id: number;
  departmentId: string;
  title: string;
  description: string;
  category: 'training' | 'health-safety' | 'resources' | 'handbooks';
  type: 'video' | 'pdf';
  enabled: boolean;
  thumbnail: string;
  filesCount: number;
  files: string[];
}

// Mock data - Each department has their OWN cards
const departmentContent: { [key: string]: ContentCard[] } = {
  'west-gate-social': [
    {
      id: 1,
      departmentId: 'west-gate-social',
      title: 'Bar Service Training',
      description: 'Learn the basics of bar operations at West Gate',
      category: 'training',
      type: 'video',
      enabled: true,
      thumbnail: '/api/placeholder/200/150',
      filesCount: 3,
      files: ['bar-basics.mp4', 'cocktails-101.mp4', 'closing-procedures.mp4']
    },
    {
      id: 2,
      departmentId: 'west-gate-social',
      title: 'Responsible Service of Alcohol',
      description: 'Safety protocols for serving alcohol responsibly',
      category: 'health-safety',
      type: 'pdf',
      enabled: true,
      thumbnail: '/api/placeholder/200/150',
      filesCount: 2,
      files: ['rsa-guide.pdf', 'checking-id.pdf']
    },
    {
      id: 3,
      departmentId: 'west-gate-social',
      title: 'POS System Guide',
      description: 'How to use the West Gate point-of-sale system',
      category: 'resources',
      type: 'pdf',
      enabled: true,
      thumbnail: '/api/placeholder/200/150',
      filesCount: 1,
      files: ['pos-manual.pdf']
    },
  ],
  'perks-coffee': [
    {
      id: 4,
      departmentId: 'perks-coffee',
      title: 'Coffee Preparation Basics',
      description: 'Master the art of coffee making at Perks',
      category: 'training',
      type: 'video',
      enabled: true,
      thumbnail: '/api/placeholder/200/150',
      filesCount: 4,
      files: ['espresso.mp4', 'milk-steaming.mp4', 'latte-art.mp4', 'drip-coffee.mp4']
    },
    {
      id: 5,
      departmentId: 'perks-coffee',
      title: 'Food Safety & Handling',
      description: 'Critical food safety procedures for Perks staff',
      category: 'health-safety',
      type: 'video',
      enabled: true,
      thumbnail: '/api/placeholder/200/150',
      filesCount: 2,
      files: ['food-safety-basics.mp4', 'allergen-awareness.mp4']
    },
    {
      id: 6,
      departmentId: 'perks-coffee',
      title: 'Espresso Machine Manual',
      description: 'Operation and maintenance of our espresso machines',
      category: 'resources',
      type: 'pdf',
      enabled: true,
      thumbnail: '/api/placeholder/200/150',
      filesCount: 1,
      files: ['machine-guide.pdf']
    },
  ],
  'care-cupboards': [
    {
      id: 7,
      departmentId: 'care-cupboards',
      title: 'Volunteer Orientation',
      description: 'Welcome guide for Care Cupboards volunteers',
      category: 'training',
      type: 'video',
      enabled: true,
      thumbnail: '/api/placeholder/200/150',
      filesCount: 1,
      files: ['volunteer-intro.mp4']
    },
    {
      id: 8,
      departmentId: 'care-cupboards',
      title: 'Food Distribution Procedures',
      description: 'Guidelines for organizing and distributing food',
      category: 'resources',
      type: 'pdf',
      enabled: true,
      thumbnail: '/api/placeholder/200/150',
      filesCount: 3,
      files: ['distribution-guide.pdf', 'inventory.pdf', 'safety.pdf']
    },
  ],
};

const departments = [
  { id: 'west-gate-social', name: 'West Gate Social' },
  { id: 'perks-coffee', name: 'Perks Coffee Shop' },
  { id: 'care-cupboards', name: 'Care Cupboards' },
  { id: 'student-life', name: 'Student Life & Events' },
];

const categories = [
  { value: 'training', label: 'Training & Presentations', color: 'blue' },
  { value: 'health-safety', label: 'Health & Safety', color: 'red' },
  { value: 'resources', label: 'Resources', color: 'purple' },
  { value: 'handbooks', label: 'Handbooks', color: 'green' },
];

export default function ManagerContentDashboard() {
  const [selectedDepartment, setSelectedDepartment] = useState('west-gate-social');
  const [cards, setCards] = useState<{ [key: string]: ContentCard[] }>(departmentContent);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingCard, setEditingCard] = useState<ContentCard | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ContentCard | null>(null);

  // Get current department's cards
  const currentCards = cards[selectedDepartment] || [];
  
  // Filter by category
  const filteredCards = filterCategory === 'all'
    ? currentCards
    : currentCards.filter(card => card.category === filterCategory);

  const toggleCard = (id: number) => {
    const updated = currentCards.map(card =>
      card.id === id ? { ...card, enabled: !card.enabled } : card
    );
    setCards({ ...cards, [selectedDepartment]: updated });
  };

  const stats = {
    total: currentCards.length,
    enabled: currentCards.filter(c => c.enabled).length,
    disabled: currentCards.filter(c => !c.enabled).length,
    byCategory: {
      training: currentCards.filter(c => c.category === 'training').length,
      safety: currentCards.filter(c => c.category === 'health-safety').length,
      resources: currentCards.filter(c => c.category === 'resources').length,
      handbooks: currentCards.filter(c => c.category === 'handbooks').length,
    }
  };

  const handleEditCard = (card: ContentCard) => {
    setEditingCard({ ...card });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editingCard) {
      const updated = currentCards.map(card =>
        card.id === editingCard.id ? editingCard : card
      );
      setCards({ ...cards, [selectedDepartment]: updated });
      setShowEditModal(false);
      setEditingCard(null);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editingCard) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingCard({ ...editingCard, thumbnail: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCard = () => {
    setShowCreateModal(true);
  };

  const handleDeleteCard = (cardId: number) => {
    if (confirm('Are you sure you want to delete this card?')) {
      const updated = currentCards.filter(card => card.id !== cardId);
      setCards({ ...cards, [selectedDepartment]: updated });
    }
  };

  const handleManageFiles = (card: ContentCard) => {
    setSelectedCard(card);
    setShowFileModal(true);
  };

  const handleAddFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedCard) {
      const updatedCard = {
        ...selectedCard,
        files: [...selectedCard.files, file.name],
        filesCount: selectedCard.files.length + 1
      };
      const updated = currentCards.map(card =>
        card.id === selectedCard.id ? updatedCard : card
      );
      setCards({ ...cards, [selectedDepartment]: updated });
      setSelectedCard(updatedCard);
    }
  };

  const handleDeleteFile = (fileName: string) => {
    if (selectedCard) {
      const updatedCard = {
        ...selectedCard,
        files: selectedCard.files.filter(f => f !== fileName),
        filesCount: selectedCard.files.length - 1
      };
      const updated = currentCards.map(card =>
        card.id === selectedCard.id ? updatedCard : card
      );
      setCards({ ...cards, [selectedDepartment]: updated });
      setSelectedCard(updatedCard);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Enhanced Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-200/90 via-blue-200/70 to-blue-100/80" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8BC53F]/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#26A9E0]/30 rounded-full blur-3xl" />
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
              onClick={handleCreateCard}
              className="px-4 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors text-sm font-medium flex items-center gap-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Plus className="w-4 h-4" />
              Create New Card
            </button>
          </div>
          <p 
            className="text-gray-600 mt-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Create and manage content cards specific to your department
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Department Selector */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Managing Content For:
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full md:w-96 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent outline-none text-lg font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Cards</div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="text-3xl font-bold text-[#8BC53F] mb-1">{stats.enabled}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.byCategory.training}</div>
            <div className="text-xs text-gray-600">Training</div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="text-2xl font-bold text-red-600 mb-1">{stats.byCategory.safety}</div>
            <div className="text-xs text-gray-600">Safety</div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.byCategory.resources}</div>
            <div className="text-xs text-gray-600">Resources</div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.byCategory.handbooks}</div>
            <div className="text-xs text-gray-600">Handbooks</div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Your Department's Content:</strong> These cards are specific to {departments.find(d => d.id === selectedDepartment)?.name}. 
            Create cards with training materials, procedures, and resources relevant to your staff.
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent outline-none"
          >
            <option value="all">All Categories ({currentCards.length} cards)</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Cards List */}
        {filteredCards.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Cards Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first content card to get started
            </p>
            <button
              onClick={handleCreateCard}
              className="px-6 py-3 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Card
            </button>
          </div>
        ) : (
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
                        {card.enabled && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                        <img src={card.thumbnail} alt={card.title} className="w-full h-full object-cover" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase ${
                            card.type === 'video' ? 'bg-[#3B82F6]' : 'bg-[#EF4444]'
                          }`}>
                            {card.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{card.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <FileText className="w-4 h-4" />
                        <span>{card.filesCount} {card.filesCount === 1 ? 'file' : 'files'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCard(card)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleManageFiles(card)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Manage Files
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        card.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {card.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal - Same as before */}
      {showEditModal && editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Card</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                <div className="flex items-center gap-4">
                  <img src={editingCard.thumbnail} alt="Thumbnail" className="w-32 h-24 rounded-lg object-cover" />
                  <label className="px-4 py-2 bg-[#26A9E0] text-white rounded-lg hover:bg-[#0D6537] cursor-pointer flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Change Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingCard.title}
                  onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] outline-none"
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingCard.description}
                  onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] outline-none"
                />
              </div>
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={editingCard.category}
                  onChange={(e) => setEditingCard({ ...editingCard, category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={editingCard.type === 'video'}
                      onChange={() => setEditingCard({ ...editingCard, type: 'video' })}
                      className="w-4 h-4"
                    />
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-[#3B82F6]">VIDEO</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={editingCard.type === 'pdf'}
                      onChange={() => setEditingCard({ ...editingCard, type: 'pdf' })}
                      className="w-4 h-4"
                    />
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-[#EF4444]">PDF</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button onClick={() => setShowEditModal(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="px-6 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Management Modal - Same as before */}
      {showFileModal && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Manage Files</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedCard.title}</p>
              </div>
              <button onClick={() => setShowFileModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#26A9E0] cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PDF, MP4, or other supported files</p>
                </div>
                <input type="file" onChange={handleAddFile} className="hidden" />
              </label>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 mb-3">Current Files ({selectedCard.files.length})</h3>
                {selectedCard.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700">{file}</span>
                    </div>
                    <button onClick={() => handleDeleteFile(file)} className="p-1 hover:bg-red-100 rounded">
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t flex justify-end">
              <button onClick={() => setShowFileModal(false)} className="px-6 py-2 bg-[#26A9E0] text-white rounded-lg hover:bg-[#0D6537]">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}