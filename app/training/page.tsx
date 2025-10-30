'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Play, FileText } from 'lucide-react';
import Link from 'next/link';
// MODIFICATION: Import from templates.ts instead of cards.ts
import { listTemplates, CardTemplate } from '@/lib/portal/templates'; 
import { useAuth } from '@/contexts/AuthContext';

export default function TrainingPage() {
  const { userData } = useAuth();
  const orgId = userData?.department || "samru";

  // MODIFICATION: State now holds CardTemplate objects
  const [templates, setTemplates] = useState<CardTemplate[]>([]); 
  const [loading, setLoading] = useState(true);

  // Fetch templates from Firestore
  useEffect(() => {
    setLoading(true);
    // MODIFICATION: Call listTemplates
    // NOTE: We assume listTemplates fetches ALL templates for now.
    // You might need to modify listTemplates later to filter by category='training'
    listTemplates(orgId) 
      .then(fetchedTemplates => {
        // Assuming CardTemplate has a 'status' field like Card did
        // If not, remove the .filter() part
        setTemplates(fetchedTemplates.filter(template => template.status === 'active')); 
        setLoading(false);
      })
      .catch((error: any) => { // Add type 'any' to error
        console.error("Error fetching training templates:", error);
        setLoading(false);
      });
  }, [orgId]); 

  // MODIFICATION: Use templates state
  const filteredItems = templates;

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
            href="/portal" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors w-fit"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Portal</span>
          </Link>
        </div>
      </header>

      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-8">
         {/* ... (Header content remains the same) ... */}
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

      {/* Filter Pills (Commented out - depends on template properties) */}
      {/* ... */}

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading templates...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* MODIFICATION: Map over 'filteredItems' (which is now templates) */}
            {filteredItems.map((template) => ( 
              // MODIFICATION: Link might go to a page showing template details or generating a card
              <Link
                key={template.id}
                href={`/portal/template/${template.id}`} // Example link
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
                  <div className="relative h-40 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                    {/* MODIFICATION: Use template.heroImage */}
                    <img
                      src={template.heroImage || '/api/placeholder/400/300'} 
                      alt={template.title || 'Template Image'}
                      // --- IMAGE HEIGHT IS SET HERE (h-40) ---
                      className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                     {/* Badges/Overlays depend on template properties - adapt as needed */}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3
                      className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#26A9E0] transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {/* MODIFICATION: Use template.title */}
                      {template.title || 'Untitled Template'}
                    </h3>
                    <p
                      className="text-gray-600 text-sm mb-4 line-clamp-2"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {/* MODIFICATION: Use template.description */}
                      {template.description || 'No description available.'}
                    </p>
                    
                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                       {/* Meta info depends on template properties - adapt as needed */}
                      <span className="text-[#26A9E0] font-medium group-hover:underline">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-16">
            {/* ... (Empty state remains the same, maybe change text) ... */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 
              className="text-xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              No templates found
            </h3>
            <p 
              className="text-gray-600"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              There are no training templates available at this time.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}