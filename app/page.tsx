'use client';

import { FileText, HeartPulse, BookOpen, Book } from 'lucide-react';
import Link from 'next/link';

const categories = [
  {
    id: 'training',
    title: 'Training & Presentations',
    description: 'Access training videos, onboarding materials, and presentation resources for staff development',
    icon: FileText,
    gradient: 'from-[#8BC53F] to-[#65953B]',
    href: '/training',
    count: 12
  },
  {
    id: 'health-safety',
    title: 'Health & Safety',
    description: 'Emergency procedures, workplace safety protocols, and health guidelines',
    icon: HeartPulse,
    gradient: 'from-[#26A9E0] to-[#0D6537]',
    href: '/health-safety',
    count: 8
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Brand guidelines, templates, forms, and essential documents for daily operations',
    icon: BookOpen,
    gradient: 'from-[#65953B] to-[#8BC53F]',
    href: '/resources',
    count: 15
  },
  {
    id: 'handbooks',
    title: 'Handbooks',
    description: 'Employee handbooks, policy manuals, and comprehensive operational guides',
    icon: Book,
    gradient: 'from-[#0D6537] to-[#26A9E0]',
    href: '/handbooks',
    count: 10
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Bubble Gradient Background - SAMRU Brand Style */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/80 via-blue-100/60 to-white" />
        {/* Decorative Bubbles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8BC53F]/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#26A9E0]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#65953B]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/4 w-72 h-72 bg-[#0D6537]/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              samru
            </div>
            <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Staff Portal
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <h1 
          className="text-5xl md:text-6xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Welcome to Your Portal
        </h1>
        <p 
          className="text-xl text-gray-600 max-w-2xl"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Everything you need to succeed at SAMRU - training, resources, and support in one place.
        </p>
      </section>

      {/* Category Cards - 3 Column Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={category.href}
                className="group"
              >
                <div className="
                  bg-white rounded-2xl overflow-hidden
                  shadow-lg hover:shadow-2xl
                  transform hover:-translate-y-2
                  transition-all duration-300
                  border border-gray-100
                  h-full
                ">
                  {/* Gradient Header with Icon */}
                  <div className={`h-36 bg-gradient-to-br ${category.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="transform group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-16 h-16 text-white/90" strokeWidth={1.5} />
                      </div>
                    </div>
                    {/* Count Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="font-bold text-sm text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {category.count} items
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 
                      className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#26A9E0] transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {category.title}
                    </h2>
                    <p 
                      className="text-gray-600 text-sm leading-relaxed mb-4"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {category.description}
                    </p>
                    
                    {/* Arrow indicator */}
                    <div className="flex items-center text-[#26A9E0] font-semibold group-hover:gap-2 gap-1 transition-all text-sm">
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>Explore</span>
                      <span className="text-lg">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}