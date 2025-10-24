'use client';

import { useState, useRef } from 'react';
import { 
  Search, Plus, Upload, FileText, Video, Image as ImageIcon, 
  FileCode, Trash2, Edit, Eye, BarChart3, ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

// Type definitions
type ContentType = 'pdf' | 'video' | 'ppt' | 'image';
type Category = 'training' | 'health-safety' | 'resources' | 'handbooks';

interface ContentItem {
  id: number;
  category: Category;
  title: string;
  description: string;
  image: string;
  updated: string;
  type: ContentType;
  views?: number;
}

// Mock data
const mockContent: ContentItem[] = [
  {
    id: 1,
    category: 'training',
    title: 'New Staff Onboarding Guide',
    description: 'Complete orientation materials for new SAMRU team members',
    image: '/api/placeholder/400/300',
    updated: 'Oct 15, 2025',
    type: 'pdf',
    views: 245
  },
  {
    id: 2,
    category: 'health-safety',
    title: 'Emergency Procedures',
    description: 'Essential safety protocols and emergency contact information',
    image: '/api/placeholder/400/300',
    updated: 'Oct 10, 2025',
    type: 'pdf',
    views: 189
  }
];

const categories = [
  { id: 'training', label: 'Training & Presentations' },
  { id: 'health-safety', label: 'Health & Safety' },
  { id: 'resources', label: 'Resources' },
  { id: 'handbooks', label: 'Handbooks' }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'content' | 'analytics'>('content');
  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Filter content
  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats calculation
  const stats = {
    total: content.length,
    training: content.filter(c => c.category === 'training').length,
    healthSafety: content.filter(c => c.category === 'health-safety').length,
    resources: content.filter(c => c.category === 'resources').length,
    handbooks: content.filter(c => c.category === 'handbooks').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span style={{ fontFamily: 'Quicksand, sans-serif' }}>Back to Portal</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: 'Ubuntu, sans-serif' }}
              >
                Super Admin Dashboard
              </h1>
            </div>
            <Link
              href="/admin/users"
              className="px-4 py-2 bg-[#26A9E0] text-white rounded-lg hover:bg-[#0D6537] transition-colors text-sm font-medium"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              Manage Users
            </Link>
          </div>
          <p 
            className="text-gray-600 mt-1"
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            Analytics & Content Management
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('content')}
            className={`
              px-6 py-3 font-medium transition-colors relative
              ${activeTab === 'content' 
                ? 'text-[#26A9E0] border-b-2 border-[#26A9E0]' 
                : 'text-gray-600 hover:text-gray-900'}
            `}
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            📁 Content Management
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`
              px-6 py-3 font-medium transition-colors relative
              ${activeTab === 'analytics' 
                ? 'text-[#26A9E0] border-b-2 border-[#26A9E0]' 
                : 'text-gray-600 hover:text-gray-900'}
            `}
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {/* Content Management Tab */}
      {activeTab === 'content' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
              <div className="text-3xl font-bold text-[#8BC53F] mb-1" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
                {stats.total}
              </div>
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                All Content
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
              <div className="text-3xl font-bold text-gray-400 mb-1" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
                {stats.training}
              </div>
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                Training
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
              <div className="text-3xl font-bold text-gray-400 mb-1" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
                {stats.healthSafety}
              </div>
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                Health & Safety
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
              <div className="text-3xl font-bold text-gray-400 mb-1" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
                {stats.resources}
              </div>
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                Resources
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
              <div className="text-3xl font-bold text-gray-400 mb-1" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
                {stats.handbooks}
              </div>
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                Handbooks
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent outline-none"
                  style={{ fontFamily: 'Quicksand, sans-serif' }}
                />
              </div>

              {/* Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as Category | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent outline-none"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>

              {/* Add Content Button */}
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors flex items-center gap-2 font-medium whitespace-nowrap"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                <Plus className="w-5 h-5" />
                Add Content
              </button>
            </div>
          </div>

          {/* Content Table */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                      Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                      Views
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContent.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium text-gray-900" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                          {categories.find(c => c.id === item.category)?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium uppercase" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                        {item.updated}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                        {item.views || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-600 hover:text-[#26A9E0] transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-[#8BC53F] transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredContent.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
                  No content found
                </h3>
                <p className="text-gray-600 mb-6" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                  Click "Add Content" to get started
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
                Analytics Dashboard
              </h3>
              <p className="text-gray-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                Track content views, engagement, and usage patterns
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
}

// Upload Modal Component
function UploadModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'training' as Category,
    type: 'pdf' as ContentType,
    videoUrl: '',
    file: null as File | null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle upload logic here
    console.log('Uploading:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
            Add New Content
          </h2>
          <p className="text-gray-600 mt-1" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            Upload documents, videos, presentations, or images
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent outline-none"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
              placeholder="Enter content title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent outline-none"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
              placeholder="Brief description of the content"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent outline-none"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              Content Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentType })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent outline-none"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              <option value="pdf">PDF Document</option>
              <option value="video">Video</option>
              <option value="ppt">PowerPoint</option>
              <option value="image">Image</option>
            </select>
          </div>

          {/* Video URL (if video type) */}
          {formData.type === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                Video URL (YouTube/Vimeo)
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent outline-none"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                Or upload a video file below
              </p>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              Upload File {formData.type !== 'video' && '*'}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#26A9E0] transition-colors cursor-pointer"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                {formData.file ? formData.file.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                PDF, PPT, Video, or Image files
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.ppt,.pptx,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif"
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              Thumbnail Image (4:3 ratio recommended)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent outline-none"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors font-medium"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              Upload Content
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
