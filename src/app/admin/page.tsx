'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Edit, FileText, X, Upload, Save, Trash2, Folder, File, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Types
interface FileItem {
  id: number;
  name: string;
  type: string;
  url: string;
}

interface SubCard {
  id: number;
  title: string;
  description: string;
  files: FileItem[];
}

interface CardTemplate {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  directFiles: FileItem[];
  subCards: SubCard[];
}

interface DepartmentContent {
  [departmentId: string]: CardTemplate[];
}

// 8 Card Template Types
const cardTemplateTypes = [
  { id: 'staff-orientation', name: 'Staff Orientation', defaultDesc: 'Essential information for new staff members' },
  { id: 'volunteer-orientation', name: 'Volunteer Orientation', defaultDesc: 'Welcome guide for volunteers' },
  { id: 'training', name: 'Training & Presentations', defaultDesc: 'Training modules and educational content' },
  { id: 'health-safety', name: 'Health & Safety', defaultDesc: 'Safety procedures and protocols' },
  { id: 'forms', name: 'Forms', defaultDesc: 'Required forms and documentation' },
  { id: 'policies', name: 'Policies & Procedures', defaultDesc: 'Organizational policies and procedures' },
  { id: 'manuals', name: 'Manuals & Handbooks', defaultDesc: 'Reference guides and handbooks' },
  { id: 'resources', name: 'Resources', defaultDesc: 'Additional resources and materials' },
];

// Mock data
const mockDepartmentContent: DepartmentContent = {
  'west-gate-social': [
    {
      id: 'training',
      name: 'Training & Presentations',
      enabled: true,
      description: 'Comprehensive training modules for West Gate staff covering bar service, customer service, and safety.',
      directFiles: [
        { id: 1, name: 'Welcome to West Gate.mp4', type: 'video', url: '#' },
        { id: 2, name: 'General Guidelines.pdf', type: 'pdf', url: '#' },
      ],
      subCards: [
        {
          id: 1,
          title: 'Customer Service Excellence',
          description: 'Learn how to provide outstanding service',
          files: [
            { id: 3, name: 'customer-service-intro.mp4', type: 'video', url: '#' },
            { id: 4, name: 'handling-complaints.mp4', type: 'video', url: '#' },
            { id: 5, name: 'service-standards.pdf', type: 'pdf', url: '#' },
          ]
        },
        {
          id: 2,
          title: 'Bar Service 101',
          description: 'Master the basics of bar operations',
          files: [
            { id: 6, name: 'bar-basics.mp4', type: 'video', url: '#' },
            { id: 7, name: 'cocktail-recipes.pptx', type: 'ppt', url: '#' },
            { id: 8, name: 'drink-menu.pdf', type: 'pdf', url: '#' },
          ]
        },
      ]
    },
    {
      id: 'health-safety',
      name: 'Health & Safety',
      enabled: true,
      description: 'Critical safety information and procedures for West Gate operations.',
      directFiles: [
        { id: 9, name: 'emergency-procedures.pdf', type: 'pdf', url: '#' },
        { id: 10, name: 'alcohol-safety.pdf', type: 'pdf', url: '#' },
      ],
      subCards: []
    },
  ],
  'perks-coffee': [
    {
      id: 'training',
      name: 'Training & Presentations',
      enabled: true,
      description: 'Coffee preparation and customer service training for Perks staff.',
      directFiles: [
        { id: 11, name: 'welcome-to-perks.mp4', type: 'video', url: '#' },
      ],
      subCards: [
        {
          id: 3,
          title: 'Coffee Preparation',
          description: 'Master the art of coffee making',
          files: [
            { id: 12, name: 'espresso-basics.mp4', type: 'video', url: '#' },
            { id: 13, name: 'milk-steaming.mp4', type: 'video', url: '#' },
            { id: 14, name: 'latte-art.mp4', type: 'video', url: '#' },
          ]
        },
      ]
    },
  ],
};

const departments = [
  { id: 'west-gate-social', name: 'West Gate Social' },
  { id: 'perks-coffee', name: 'Perks Coffee Shop' },
  { id: 'care-cupboards', name: 'Care Cupboards' },
];

export default function AdminDashboard() {
  const [selectedDepartment, setSelectedDepartment] = useState('west-gate-social');
  const [content, setContent] = useState<DepartmentContent>(mockDepartmentContent);
  const [selectedCard, setSelectedCard] = useState<CardTemplate | null>(null);
  const [showCardSelector, setShowCardSelector] = useState(false);
  const [showEditDescription, setShowEditDescription] = useState(false);
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [showCreateSubCardModal, setShowCreateSubCardModal] = useState(false);
  const [showSubCardFiles, setShowSubCardFiles] = useState<number | null>(null);
  const [editingDescription, setEditingDescription] = useState('');

  const currentCards = content[selectedDepartment] || [];

  const stats = {
    totalCards: currentCards.length,
    enabled: currentCards.filter(c => c.enabled).length,
    totalFiles: currentCards.reduce((acc, card) => 
      acc + card.directFiles.length + card.subCards.reduce((sum, sc) => sum + sc.files.length, 0), 0
    ),
    totalSubCards: currentCards.reduce((acc, card) => acc + card.subCards.length, 0),
  };

  const handleAddCardTemplate = (templateId: string) => {
    const template = cardTemplateTypes.find(t => t.id === templateId);
    if (!template) return;

    const newCard: CardTemplate = {
      id: templateId,
      name: template.name,
      enabled: true,
      description: template.defaultDesc,
      directFiles: [],
      subCards: [],
    };

    setContent({
      ...content,
      [selectedDepartment]: [...currentCards, newCard]
    });
    setShowCardSelector(false);
  };

  const handleToggleCard = (cardId: string) => {
    const updated = currentCards.map(card =>
      card.id === cardId ? { ...card, enabled: !card.enabled } : card
    );
    setContent({ ...content, [selectedDepartment]: updated });
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Delete this card and all its content?')) {
      const updated = currentCards.filter(card => card.id !== cardId);
      setContent({ ...content, [selectedDepartment]: updated });
    }
  };

  const handleEditDescription = (card: CardTemplate) => {
    setSelectedCard(card);
    setEditingDescription(card.description);
    setShowEditDescription(true);
  };

  const handleSaveDescription = () => {
    if (selectedCard) {
      const updated = currentCards.map(card =>
        card.id === selectedCard.id ? { ...card, description: editingDescription } : card
      );
      setContent({ ...content, [selectedDepartment]: updated });
      setShowEditDescription(false);
      setSelectedCard(null);
    }
  };

  const handleAddDirectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedCard) {
      const newFile: FileItem = {
        id: Date.now(),
        name: file.name,
        type: file.name.split('.').pop() || 'file',
        url: '#'
      };

      const updated = currentCards.map(card =>
        card.id === selectedCard.id
          ? { ...card, directFiles: [...card.directFiles, newFile] }
          : card
      );
      setContent({ ...content, [selectedDepartment]: updated });
    }
  };

  const handleDeleteDirectFile = (cardId: string, fileId: number) => {
    const updated = currentCards.map(card =>
      card.id === cardId
        ? { ...card, directFiles: card.directFiles.filter(f => f.id !== fileId) }
        : card
    );
    setContent({ ...content, [selectedDepartment]: updated });
  };

  const handleCreateSubCard = (title: string, description: string) => {
    if (selectedCard) {
      const newSubCard: SubCard = {
        id: Date.now(),
        title,
        description,
        files: []
      };

      const updated = currentCards.map(card =>
        card.id === selectedCard.id
          ? { ...card, subCards: [...card.subCards, newSubCard] }
          : card
      );
      setContent({ ...content, [selectedDepartment]: updated });
      setShowCreateSubCardModal(false);
    }
  };

  const handleDeleteSubCard = (cardId: string, subCardId: number) => {
    if (confirm('Delete this sub-card and all its files?')) {
      const updated = currentCards.map(card =>
        card.id === cardId
          ? { ...card, subCards: card.subCards.filter(sc => sc.id !== subCardId) }
          : card
      );
      setContent({ ...content, [selectedDepartment]: updated });
    }
  };

  const availableTemplates = cardTemplateTypes.filter(
    template => !currentCards.some(card => card.id === template.id)
  );

  return (
    <div className="min-h-screen relative">
      {/* Background */}
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
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Portal</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Content Manager</h1>
            </div>
            <button
              onClick={() => setShowCardSelector(true)}
              className="px-4 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Card Template
            </button>
          </div>
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
          >
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalCards}</div>
            <div className="text-sm text-gray-600">Card Templates</div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="text-3xl font-bold text-[#8BC53F] mb-1">{stats.enabled}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalSubCards}</div>
            <div className="text-sm text-gray-600">Sub-Cards</div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-1">{stats.totalFiles}</div>
            <div className="text-sm text-gray-600">Total Files</div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>How it works:</strong> Add card templates, then upload files directly to the card OR create sub-cards to organize content into sections. Staff will see both direct files and sub-cards.
          </p>
        </div>

        {/* Cards List */}
        {currentCards.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Card Templates Yet</h3>
            <p className="text-gray-600 mb-6">
              Add your first card template to start organizing content
            </p>
            <button
              onClick={() => setShowCardSelector(true)}
              className="px-6 py-3 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Card Template
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {currentCards.map((card) => (
              <div key={card.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Card Header */}
                <div className={`p-6 border-b ${card.enabled ? 'bg-white' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-4">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggleCard(card.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-1 ${
                        card.enabled ? 'bg-[#8BC53F] border-[#8BC53F]' : 'bg-white border-gray-300'
                      }`}
                    >
                      {card.enabled && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{card.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          card.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {card.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{card.description}</p>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEditDescription(card)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Description
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCard(card);
                            setShowAddFileModal(true);
                          }}
                          className="px-4 py-2 bg-blue-50 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add File
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCard(card);
                            setShowCreateSubCardModal(true);
                          }}
                          className="px-4 py-2 bg-purple-50 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Create Sub-Card
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Card
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Direct Files */}
                  {card.directFiles.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                        Direct Files ({card.directFiles.length})
                      </h4>
                      <div className="space-y-2">
                        {card.directFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <File className="w-5 h-5 text-gray-400" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs uppercase">
                                {file.type}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteDirectFile(card.id, file.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-Cards */}
                  {card.subCards.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                        Sub-Cards ({card.subCards.length})
                      </h4>
                      <div className="space-y-3">
                        {card.subCards.map((subCard) => (
                          <div key={subCard.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-white">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Folder className="w-5 h-5 text-purple-600" />
                                  <h5 className="font-bold text-gray-900">{subCard.title}</h5>
                                </div>
                                <button
                                  onClick={() => handleDeleteSubCard(card.id, subCard.id)}
                                  className="p-1 hover:bg-red-100 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{subCard.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                  {subCard.files.length} {subCard.files.length === 1 ? 'file' : 'files'}
                                </span>
                                <button
                                  onClick={() => setShowSubCardFiles(showSubCardFiles === subCard.id ? null : subCard.id)}
                                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                >
                                  {showSubCardFiles === subCard.id ? 'Hide' : 'View'} Files
                                  <ChevronRight className={`w-4 h-4 transition-transform ${showSubCardFiles === subCard.id ? 'rotate-90' : ''}`} />
                                </button>
                              </div>
                            </div>
                            {showSubCardFiles === subCard.id && subCard.files.length > 0 && (
                              <div className="p-4 bg-white border-t space-y-2">
                                {subCard.files.map((file) => (
                                  <div key={file.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                                    <File className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-700">{file.name}</span>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                      {file.type}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {card.directFiles.length === 0 && card.subCards.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No content yet. Add files or create sub-cards to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Template Selector Modal */}
      {showCardSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">Add Card Template</h2>
              <button onClick={() => setShowCardSelector(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {availableTemplates.length === 0 ? (
                <p className="text-center text-gray-500 py-8">All card templates have been added!</p>
              ) : (
                <div className="space-y-3">
                  {availableTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleAddCardTemplate(template.id)}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#8BC53F] hover:bg-green-50 transition-colors text-left"
                    >
                      <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.defaultDesc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Description Modal */}
      {showEditDescription && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Description</h2>
              <button onClick={() => setShowEditDescription(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Description
              </label>
              <textarea
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] outline-none"
                placeholder="Describe what staff will find in this card..."
              />
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={() => setShowEditDescription(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDescription}
                className="px-6 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add File Modal */}
      {showAddFileModal && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">Add File to {selectedCard.name}</h2>
              <button onClick={() => setShowAddFileModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[#26A9E0] transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">Videos, PDFs, PPT, images, or other files</p>
                </div>
                <input
                  type="file"
                  onChange={(e) => {
                    handleAddDirectFile(e);
                    setShowAddFileModal(false);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Create Sub-Card Modal */}
      {showCreateSubCardModal && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">Create Sub-Card</h2>
              <button onClick={() => setShowCreateSubCardModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateSubCard(
                  formData.get('title') as string,
                  formData.get('description') as string
                );
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] outline-none"
                  placeholder="e.g., Customer Service Training"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] outline-none"
                  placeholder="Brief description of this sub-card's content..."
                />
              </div>
              <div className="pt-4 border-t flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateSubCardModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Sub-Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
