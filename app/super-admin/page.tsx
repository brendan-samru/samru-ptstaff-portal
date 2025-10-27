'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserManagement } from '@/components/UserManagement';
import { setUserRole } from "@/lib/portal/roles";
import { 
  Crown, 
  FolderPlus, 
  BarChart3, 
  Users, 
  Settings,
  FileText,
  Trash2,
  Edit3,
  Plus,
  TrendingUp,
  Eye,
  Download,
  LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CardTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  enabled: boolean;
  createdAt: Date;
  createdBy: string;
}

interface PortalAnalytics {
  managerId: string;
  managerName: string;
  department: string;
  totalViews: number;
  totalDownloads: number;
  uniqueUsers: number;
  lastActivity: Date;
}

function SuperAdminContent() {
  const { userData, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'templates' | 'analytics' | 'users'>('templates');
  const [cardTemplates, setCardTemplates] = useState<CardTemplate[]>([]);
  const [analytics, setAnalytics] = useState<PortalAnalytics[]>([]);
  const [showAddTemplate, setShowAddTemplate] = useState(false);

  // ADD THIS FUNCTION:
  const loadData = () => {
    // Refresh data after user is added
    // For now, this can be empty since you're using mock data
    console.log('User added, refreshing data...');
  };

  // Mock data - replace with Firebase queries
  useEffect(() => {
    // Fetch card templates
    setCardTemplates([
      {
        id: '1',
        title: 'Training & Presentations',
        description: 'Access training videos and onboarding materials',
        icon: 'FileText',
        gradient: 'from-[#8BC53F] to-[#65953B]',
        enabled: true,
        createdAt: new Date(),
        createdBy: 'System'
      },
      {
        id: '2',
        title: 'Health & Safety',
        description: 'Emergency procedures and workplace safety',
        icon: 'HeartPulse',
        gradient: 'from-[#26A9E0] to-[#0D6537]',
        enabled: true,
        createdAt: new Date(),
        createdBy: 'System'
      },
    ]);

    // Fetch analytics for all portals
    setAnalytics([
      {
        managerId: 'mgr1',
        managerName: 'West Gate Social Manager',
        department: 'West Gate Social',
        totalViews: 1245,
        totalDownloads: 432,
        uniqueUsers: 87,
        lastActivity: new Date()
      },
      {
        managerId: 'mgr2',
        managerName: 'Perks Manager',
        department: 'Perks Coffee',
        totalViews: 892,
        totalDownloads: 234,
        uniqueUsers: 54,
        lastActivity: new Date()
      },
    ]);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template? This will affect all portals using it.')) {
      setCardTemplates(prev => prev.filter(t => t.id !== id));
      // TODO: Implement Firebase deletion
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
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Super Admin
                </div>
                <div className="text-xs text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {userData?.displayName || userData?.email}
                </div>
              </div>
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
              onClick={() => router.push('/admin')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
            >
              Manager View
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>  {/* <- Make sure this closing div exists */}
      </header>  {/* <- Make sure this closing tag exists */}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-[#8BC53F]" />
              <span className="text-2xl font-bold text-gray-900">{analytics.length}</span>
            </div>
            <div className="text-sm text-gray-600">Active Managers</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-[#26A9E0]" />
              <span className="text-2xl font-bold text-gray-900">{cardTemplates.length}</span>
            </div>
            <div className="text-sm text-gray-600">Card Templates</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-[#65953B]" />
              <span className="text-2xl font-bold text-gray-900">
                {analytics.reduce((sum, a) => sum + a.totalViews, 0)}
              </span>
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Download className="w-8 h-8 text-[#0D6537]" />
              <span className="text-2xl font-bold text-gray-900">
                {analytics.reduce((sum, a) => sum + a.totalDownloads, 0)}
              </span>
            </div>
            <div className="text-sm text-gray-600">Total Downloads</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'templates'
                    ? 'bg-[#8BC53F] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FolderPlus className="w-4 h-4" />
                Card Templates
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
                Portal Analytics
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'users'
                    ? 'bg-[#65953B] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                User Management
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Manage Card Templates</h2>
                  <button
                    onClick={() => setShowAddTemplate(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Template
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cardTemplates.map((template) => (
                    <div key={template.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{template.title}</h3>
                            {template.enabled && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="text-xs text-gray-500">
                            Created by {template.createdBy}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteTemplate(template.id)}
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

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Portal Analytics</h2>
                <div className="space-y-4">
                  {analytics.map((portal) => (
                    <div key={portal.managerId} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{portal.department}</h3>
                          <p className="text-sm text-gray-600">{portal.managerName}</p>
                        </div>
                        <TrendingUp className="w-6 h-6 text-[#8BC53F]" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{portal.totalViews}</div>
                          <div className="text-xs text-gray-600">Total Views</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{portal.totalDownloads}</div>
                          <div className="text-xs text-gray-600">Downloads</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{portal.uniqueUsers}</div>
                          <div className="text-xs text-gray-600">Unique Users</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <div className="text-xs text-gray-500">
                          Last activity: {portal.lastActivity.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <UserManagement onUserAdded={loadData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminPage() {
  const [uid, setUid] = useState("");
  const [role, setRole] = useState<"manager"|"superadmin">("manager");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!uid) return;
    setBusy(true);
    try {
      await setUserRole(uid, role);
      alert("Role set.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="p-6 max-w-lg space-y-3">
      <h1 className="text-xl font-semibold">Set User Role</h1>
      <input
        className="w-full border rounded px-2 py-1"
        placeholder="Firebase UID"
        value={uid}
        onChange={(e) => setUid(e.target.value)}
      />
      <select
        className="w-full border rounded px-2 py-1"
        value={role}
        onChange={(e) => setRole(e.target.value as any)}
      >
        <option value="manager">manager</option>
        <option value="superadmin">superadmin</option>
      </select>
      <button className="px-4 py-2 rounded" onClick={submit} disabled={busy || !uid}>
        {busy ? "Saving…" : "Save"}
      </button>
      <p className="text-sm text-gray-600">
        UID: Firebase Console → Authentication → Users.
      </p>
      <ProtectedRoute requiredRole="super_admin">
      <SuperAdminContent />
    </ProtectedRoute>
    </div>
  );
}
