'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserManagement } from '@/components/UserManagement';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { setUserRole } from "@/lib/portal/roles";
import { FileUpload } from "@/components/FileUpload";
import { listTemplates, createTemplate, updateTemplate, deleteTemplate, CardTemplate } from "@/lib/portal/templates";
// MODIFICATION: Import storage functions
import { storage } from '@/lib/firebase/client'; // Make sure this path is correct
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  LogOut,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import 'react-quill/dist/quill.snow.css'; 
import dynamic from 'next/dynamic';
import { QuillField } from '@/components/QuillField';

 const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false 
  });

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
  const [analytics, setAnalytics] = useState<PortalAnalytics[]>([]);
  const [showAddTemplate, setShowAddTemplate] = useState(false);

  // Template management state
  const orgId = userData?.department || "samru";
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [tplBusy, setTplBusy] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Hero Image state
  const [newHero, setNewHero] = useState<string | null>(null); // This is ONLY for the <img> preview src
  const [newFile, setNewFile] = useState<File | null>(null); // MODIFICATION: Store the actual file object
  const [editing, setEditing] = useState<CardTemplate | null>(null);

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
    ],
  };

  // Load templates from Firebase
  const loadTemplates = async () => {
    try {
      const rows = await listTemplates(orgId);
      setTemplates(rows);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  // Load templates on mount
  useEffect(() => { 
    loadTemplates(); 
  }, [orgId]);

  // Reusable handler for canceling/closing the form
  const handleCancel = () => {
    setShowAddTemplate(false);
    setEditing(null);
    setNewTitle("");
    setNewDesc("");
    setNewHero(null);
    setNewFile(null); // <-- MODIFICATION: Clear file
  };

  // Refresh data callback for user management
  const loadData = () => {
    console.log('User added, refreshing data...');
  };

  // Mock analytics data - replace with Firebase queries
  useEffect(() => {
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

  // Delete template
  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template? This cannot be undone and will affect all portals using it.')) {
      return;
    }
    try {
      await deleteTemplate(orgId, id);
      await loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };
  
  // Helper function to extract file name from URL for editing
  const getFileNameFromUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      const path = decodeURIComponent(urlObj.pathname);
      const fileNameWithToken = path.split('/').pop();
      if (!fileNameWithToken) return "Uploaded Image";
      // Split on the '?' to remove auth tokens
      const encodedName = fileNameWithToken.split('?')[0];
      // Firebase Storage often saves as 'timestamp_filename.ext'
      // Try to remove the timestamp
      return encodedName.split('_').slice(1).join('_') || encodedName;
    } catch (e) {
      console.warn("Could not parse file name from URL:", url);
      return "Uploaded Image";
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
        </div>
      </header>

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
              <span className="text-2xl font-bold text-gray-900">{templates.length}</span>
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
                    ? 'bg-[#26A9E0] text-white'
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
                    ? 'bg-[#26A9E0] text-white'
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
                    onClick={() => { 
                      handleCancel(); // Use handleCancel to reset everything
                      setShowAddTemplate(true); 
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Template
                  </button>
                </div>

                {/* Add/Edit Template Form */}
                {showAddTemplate && (
                  <div className="mb-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {editing ? "Edit Template" : "Create New Template"}
                      </h3>
                      <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Image upload (images only, required) */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template Image *
                      </label>
                      <div className="grid sm:grid-cols-[160px_1fr] gap-4 items-start">
                        <div className="border rounded-lg overflow-hidden bg-white">
                          {newHero ? (
                            <img src={newHero} alt="Template preview" className="w-full h-28 object-cover" />
                          ) : (
                            <div className="w-full h-28 grid place-items-center text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>

                        <FileUpload
                          accept="image/*"
                          onFileChange={(file: File | null, localUrl: string | null) => {
                            setNewFile(file); // <-- Store the file
                            setNewHero(localUrl); // <-- Store the local preview URL
                          }}
                          // Pass existing image name to FileUpload when editing
                          initialFileName={getFileNameFromUrl(editing?.heroImage)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Template Title (optional)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC53F] focus:border-transparent"
                          placeholder="Optional title"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          disabled={tplBusy}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (optional)
                        </label>
                        <QuillField
                          value={newDesc}
                          onChange={setNewDesc}
                          modules={quillModules}
                          placeholder="Brief description of this template's purpose"
                          readOnly={tplBusy}
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          disabled={tplBusy}
                        >
                          Cancel
                        </button>

                        <button
                          onClick={async () => {
                            // Check if an image exists (either a new file or an existing one)
                            if (!newFile && !editing) {
                              alert("Please select an image to upload.");
                              return;
                            }
                            
                            setTplBusy(true);
                            // Default to existing image URL if editing and no new file is chosen
                            let uploadedUrl: string | null = editing ? (editing.heroImage || null) : null; 

                            try {
                              // --- Step 1: Upload file ONLY if a new one was selected ---
                              if (newFile) {
                                console.log("Uploading new file...");
                                const timestamp = Date.now();
                                const sanitizedName = newFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                                const fileName = `${timestamp}_${sanitizedName}`;
                                const storageRef = ref(storage, `orgs/${orgId}/cardTemplates/${fileName}`);

                                const uploadTask = uploadBytes(storageRef, newFile);

                               // Upload the file
                                await uploadBytes(storageRef, newFile);

                                // Get the final URL
                                uploadedUrl = await getDownloadURL(storageRef);
                                console.log("File uploaded:", uploadedUrl);
                              }

                              // --- Step 2: Check if we have a URL (new or existing) ---
                              if (!uploadedUrl) {
                                throw new Error("Image URL is missing. Cannot save template.");
                              }

                              // --- Step 3: Save data to Firestore ---
                              console.log("Saving template to Firestore...");
                              // Use 'undefined' for update, 'null' for create
                              const finalDescription = (newDesc === '<p><br></p>' || newDesc === '') ? null : newDesc;

                              if (editing) {
                                console.log("Updating template:", editing.id);
                                const templateData = {
                                  heroImage: uploadedUrl,
                                  title: newTitle || undefined,
                                  description: finalDescription || undefined, // <-- Use finalDescription
                                };
                                await updateTemplate(orgId, editing.id, templateData);
                              } else {
                                console.log("Creating new template...");
                                await createTemplate(orgId, {
                                  heroImage: uploadedUrl,
                                  title: newTitle || null, 
                                  description: finalDescription, // <-- Use finalDescription
                                });
                              }
                                                            
                              // --- Step 4: Reset and reload ---
                              console.log("Save successful. Resetting form.");
                              handleCancel();
                              await loadTemplates();

                            } catch (err) {
                              console.error("Error saving template:", err);
                              alert("Failed to save template. Please try again.");
                            } finally {
                              setTplBusy(false);
                            }
                          }}
                          // Disable if busy or if there's no image preview at all
                          disabled={tplBusy || !newHero}
                          className="px-4 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors disabled:opacity-50"
                        >
                          {tplBusy ? "Saving…" : (editing ? "Save Changes" : "Create Template")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Templates Grid */}
                  {templates.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No templates created yet. Click "Add Template" to get started.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {templates.map((template) => {
                        const created =
                          (template.createdAt as any)?.toDate
                            ? (template.createdAt as any).toDate()
                            : template.createdAt
                            ? new Date(template.createdAt as any)
                            : null;

                        return (
                          <div key={template.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-bold text-gray-900 text-lg">{template.title || "Untitled Template"}</h3>
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                    Active
                                  </span>
                                </div>
                                {/* Image Preview in Card */}
                                {template.heroImage && (
                                  <img src={template.heroImage} alt={template.title || ""} className="w-full h-64 object-cover rounded-lg mb-4 border border-gray-200" />
                                )}
                                {template.description && (
                                  <div 
                                    className="text-sm text-gray-600 mb-3" 
                                    dangerouslySetInnerHTML={{ __html: template.description }} 
                                  />
                                )}
                                {created && (
                                  <div className="text-xs text-gray-500">
                                    Created {created.toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  // Populate the form with the template's data
                                  setNewTitle(template.title || "");
                                  setNewDesc(template.description || "");
                                  setNewHero(template.heroImage || null); // <-- Set preview to existing image
                                  setNewFile(null); // <-- Clear any selected file
                                  setEditing(template);
                                  setShowAddTemplate(true);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
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
                        );
                      })}
                    </div>
                  )}
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
  return (
    <ProtectedRoute requiredRole="super_admin">
      <SuperAdminContent />
    </ProtectedRoute>
  );
}