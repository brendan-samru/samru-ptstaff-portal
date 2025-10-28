'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FileUpload } from '@/components/FileUpload';
import { createContentItem, getContentByDepartment, ContentItem as ContentItemType } from '@/lib/content';
import { 
  FileText, 
  Upload, 
  BarChart3, 
  Eye,
  Download,
  Edit3,
  Trash2,
  Plus,
  LogOut,
  Settings,
  TrendingUp,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAnalytics } from '@/lib/analytics';
import ContentList from "@/components/admin/ContentList";
import { TemplatesModal } from "@/components/admin/TemplatesModal";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'document';
  category: string;
  thumbnail?: string;
  downloadable: boolean;
  enabled: boolean;
  views: number;
  downloads: number;
  createdAt: Date;
}

interface UploadFormProps {
  department: string;
  createdBy: string;
  onUploadSuccess: () => void;
}

function UploadForm({ department, createdBy, onUploadSuccess }: UploadFormProps) {
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    fileName: string;
    fileType: string;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Training & Presentations',
    downloadable: true,
    enabled: true
  });
  
  const [saving, setSaving] = useState(false);

  const handleUploadComplete = (url: string, fileName: string, fileType: string) => {
    setUploadedFile({ url, fileName, fileType });
    // Auto-populate title from filename
    const titleFromFile = fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    setFormData(prev => ({ ...prev, title: titleFromFile }));
  };

  const handleSave = async () => {
    if (!uploadedFile) {
      alert('Please upload a file first');
      return;
    }

    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    setSaving(true);

    try {
      await createContentItem({
        title: formData.title,
        description: formData.description,
        fileUrl: uploadedFile.url,
        fileName: uploadedFile.fileName,
        fileType: uploadedFile.fileType as 'video' | 'pdf' | 'document',
        category: formData.category,
        department: department,
        downloadable: formData.downloadable,
        enabled: formData.enabled,
        createdBy: createdBy
      });

      alert('Content saved successfully!');
      
      // Reset form
      setUploadedFile(null);
      setFormData({
        title: '',
        description: '',
        category: 'Training & Presentations',
        downloadable: true,
        enabled: true
      });
      
      onUploadSuccess();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <FileUpload
        onUploadComplete={handleUploadComplete}
        storagePath={`content/${department}`}
      />

      {/* Show form only after file is uploaded */}
      {uploadedFile && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-800 font-medium mb-1">
                  File uploaded successfully!
                </p>
                <p className="text-sm text-green-700">
                  Now add details about this content below.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent"
                placeholder="e.g., Staff Training Video"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent"
                rows={3}
                placeholder="Brief description of the content"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent"
              >
                <option>Training & Presentations</option>
                <option>Health & Safety</option>
                <option>Resources</option>
                <option>Handbooks</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.downloadable}
                  onChange={(e) => setFormData(prev => ({ ...prev, downloadable: e.target.checked }))}
                  className="w-4 h-4 text-[#26A9E0] rounded focus:ring-[#26A9E0]"
                />
                <span className="text-sm text-gray-700">Allow downloads</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4 text-[#26A9E0] rounded focus:ring-[#26A9E0]"
                />
                <span className="text-sm text-gray-700">Enable immediately</span>
              </label>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !formData.title.trim()}
              className="w-full bg-[#8BC53F] text-white py-3 px-4 rounded-lg hover:bg-[#65953B] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Content'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}


function AdminDashboardContent() {
  const { userData, logout } = useAuth();
  const router = useRouter();
  const { getManagerAnalytics } = useAnalytics();
  
  const [activeTab, setActiveTab] = useState<'content' | 'analytics' | 'upload'>('content');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openTemplates, setOpenTemplates] = useState(false);

  useEffect(() => {
    loadData();
  }, [userData]);

  const loadData = async () => {
    if (!userData) return;
    
    setLoading(true);
    
    // Load content items - TODO: Replace with actual Firestore query
    // This is mock data for demonstration
    setContentItems([
      {
        id: '1',
        title: 'Staff Training Video',
        description: 'Onboarding materials for new team members',
        type: 'video',
        category: 'Training',
        downloadable: true,
        enabled: true,
        views: 245,
        downloads: 87,
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'Safety Procedures Manual',
        description: 'Workplace safety protocols and guidelines',
        type: 'pdf',
        category: 'Health & Safety',
        downloadable: true,
        enabled: true,
        views: 156,
        downloads: 64,
        createdAt: new Date()
      },
      {
        id: '3',
        title: 'Brand Guidelines',
        description: 'SAMRU branding standards and assets',
        type: 'pdf',
        category: 'Resources',
        downloadable: false,
        enabled: true,
        views: 98,
        downloads: 12,
        createdAt: new Date()
      }
    ]);

    // Load analytics
    if (userData.uid) {
      try {
        const analyticsData = await getManagerAnalytics(userData.uid);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const toggleDownloadable = (id: string) => {
    setContentItems(prev => prev.map(item => 
      item.id === id ? { ...item, downloadable: !item.downloadable } : item
    ));
    // TODO: Update in Firestore
  };

  const toggleEnabled = (id: string) => {
    setContentItems(prev => prev.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
    // TODO: Update in Firestore
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      setContentItems(prev => prev.filter(item => item.id !== id));
      // TODO: Delete from Firestore
    }
  };

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/80 via-blue-100/60 to-white" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8BC53F]/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#26A9E0]/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8BC53F] to-[#26A9E0] rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Admin Dashboard
                </div>
                <div className="text-xs text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {userData?.department || 'Manager'} • {userData?.displayName || userData?.email}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Content</h2>

            <div className="flex items-center gap-2">
              {/* Open the template picker (green primary) */}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/portal')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
            >
              View Portal
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-[#8BC53F]" />
              <span className="text-2xl font-bold text-gray-900">{contentItems.length}</span>
            </div>
            <div className="text-sm text-gray-600">Content Items</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-[#26A9E0]" />
              <span className="text-2xl font-bold text-gray-900">
                {analytics?.totalViews || contentItems.reduce((sum, item) => sum + item.views, 0)}
              </span>
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Download className="w-8 h-8 text-[#65953B]" />
              <span className="text-2xl font-bold text-gray-900">
                {analytics?.totalDownloads || contentItems.reduce((sum, item) => sum + item.downloads, 0)}
              </span>
            </div>
            <div className="text-sm text-gray-600">Downloads</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-[#0D6537]" />
              <span className="text-2xl font-bold text-gray-900">
                {analytics?.uniqueUsers || 0}
              </span>
            </div>
            <div className="text-sm text-gray-600">Unique Users</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'content'
                    ? 'bg-[#26A9E0] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                Content
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'upload'
                    ? 'bg-[#26A9E0] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload New
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-[#26A9E0] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Content Tab */}
            {activeTab === 'content' && (
              <div>
                {/* My Content header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Your Content</h3>

                  <div className="flex items-center gap-2">
                    {/* existing Add Content button */}
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="flex items-center gap-2 px-3 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Content
                    </button>

                    {/* new: open the template picker, right next to Add Content */}
                    <button
                      onClick={() => setOpenTemplates(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Create a card from a template"
                    >
                      <FileText className="w-4 h-4" />
                      Card Template
                    </button>
                    {/*
                      If you want this one green too, swap className with:
                      "flex items-center gap-2 px-3 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors"
                    */}
                  </div>
                </div>

                <div className="space-y-4">
                  {contentItems.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                            {item.enabled ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Live
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                                Draft
                              </span>
                            )}
                            {item.downloadable && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                Downloadable
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {item.views} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              {item.downloads} downloads
                            </span>
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleEnabled(item.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          {item.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button 
                          onClick={() => toggleDownloadable(item.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          {item.downloadable ? 'Lock Download' : 'Allow Download'}
                        </button>
                        <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload New Content</h2>
                
                <div className="max-w-2xl">
                  <UploadForm 
                    department={userData?.department || 'general'}
                    createdBy={userData?.uid || ''}
                    onUploadSuccess={() => {
                      loadData(); // Refresh content list
                      setActiveTab('content'); // Switch to content tab
                    }}
                  />
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {userData?.department || 'Your'} Portal Analytics
                </h2>
                
                {analytics ? (
                  <div className="space-y-6">
                    {/* Top Resources */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Content</h3>
                      <div className="space-y-3">
                        {contentItems
                          .sort((a, b) => (b.views + b.downloads) - (a.views + a.downloads))
                          .slice(0, 5)
                          .map((item, index) => (
                            <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-[#8BC53F] text-white rounded-lg flex items-center justify-center font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{item.title}</div>
                                  <div className="text-sm text-gray-600">{item.category}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-6 text-sm">
                                <span className="text-gray-600">
                                  <Eye className="w-4 h-4 inline mr-1" />
                                  {item.views}
                                </span>
                                <span className="text-gray-600">
                                  <Download className="w-4 h-4 inline mr-1" />
                                  {item.downloads}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Activity Summary */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="grid grid-cols-3 gap-6 text-center">
                          <div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                              {analytics.totalViews}
                            </div>
                            <div className="text-sm text-gray-600">Total Views</div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                              {analytics.totalDownloads}
                            </div>
                            <div className="text-sm text-gray-600">Downloads</div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                              {analytics.uniqueUsers}
                            </div>
                            <div className="text-sm text-gray-600">Unique Users</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No analytics data yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Analytics will appear once users start viewing your content
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <TemplatesModal
        orgId={userData?.department || 'samru'}
        open={openTemplates}
        onClose={() => setOpenTemplates(false)}
        onCreated={() => {
          // After creating a card, refresh the list and show the Content tab
          loadData();
          setActiveTab('content');
        }}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
    
  );
}
