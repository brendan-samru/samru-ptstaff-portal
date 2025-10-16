'use client';

import React, { useState, useEffect } from 'react';

// Helper components for icons to avoid external dependencies
const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#94c13c] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const PresentationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#94c13c] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const AdminIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


// Mock data for the resources
const resources = {
    policies: [
        { id: 1, title: 'Employee Handbook', description: 'General policies and code of conduct.', link: '#' },
        { id: 2, title: 'Health & Safety Policy', description: 'Protocols for workplace safety.', link: '#' },
        { id: 3, title: 'IT & Security Guidelines', description: 'Best practices for using company equipment.', link: '#' },
    ],
    presentations: [
        { id: 1, title: 'New Staff Onboarding', description: 'Orientation presentation for new hires.', link: '#' },
        { id: 2, title: 'Customer Service Excellence', description: 'Training on providing top-tier service.', link: '#' },
        { id: 3, title: 'Annual Review Process', description: 'How to prepare for your annual review.', link: '#' },
    ],
};

// Main App Component
export default function StaffPortal() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for a logged-in session
        const session = sessionStorage.getItem('isLoggedIn');
        const role = sessionStorage.getItem('userRole');
        if (session && role) {
            setIsLoggedIn(true);
            setUserRole(role);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Admin user
        if (username === 'admin' && password === 'adminpass') {
            setIsLoggedIn(true);
            setUserRole('admin');
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userRole', 'admin');
            setError('');
        // Staff user
        } else if (username === 'staff' && password === 'password') {
            setIsLoggedIn(true);
            setUserRole('staff');
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userRole', 'staff');
            setError('');
        } else {
            setError('Invalid username or password.');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserRole(null);
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userRole');
        setUsername('');
        setPassword('');
    };
    
    // Loading state to prevent flash of login page if session exists
    if (isLoading) {
        return <div className="bg-gray-100 min-h-screen flex items-center justify-center"></div>
    }

    // LOGIN PAGE VIEW
    if (!isLoggedIn) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                    <div className="flex justify-center mb-6">
                        <img src="/logo-signin.jpg" alt="SAMRULogo" className="w-64" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Part-Time Staff Portal</h1>
                    <p className="text-center text-gray-500 mb-6">Please sign in to access resources.</p>
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#94c13c]"
                                placeholder="staff or admin"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-[#94c13c]"
                                placeholder="password or adminpass"
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                className="bg-[#94c13c] hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors"
                            >
                                Sign In
                            </button>
                        </div>
                         <div className="text-center mt-4">
                            <a href="#" className="inline-block align-baseline font-bold text-sm text-[#00a99d] hover:text-teal-700 transition-colors">
                                Don&apos;t have an account? Register
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // PORTAL VIEW (after login)
    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <img src="/logo-nav.png" alt="SAMRULogoNav" className="h-18" />
                    <div className="flex items-center space-x-4">
                         <a href="https://samru.ca" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#00a99d] transition-colors">
                            Visit samru.ca
                        </a>
                        <button
                            onClick={handleLogout}
                            className="bg-[#94c13c] hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">Staff Resources</h1>
                
                {/* Admin Controls Section - Conditionally Rendered */}
                {userRole === 'admin' && (
                    <section className="mb-12 bg-teal-50 border-2 border-teal-200 rounded-lg p-6">
                        <div className="flex items-center">
                            <AdminIcon />
                            <h2 className="text-2xl font-semibold text-gray-700">Admin Controls</h2>
                        </div>
                        <p className="text-gray-600 mt-2 mb-4">You are logged in as an administrator. You have access to additional controls.</p>
                        <div className="flex space-x-4">
                            <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Upload Document</button>
                            <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Manage Users</button>
                        </div>
                    </section>
                )}

                {/* Policies Section */}
                <section>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-1">Policies & Procedures</h2>
                     <hr className="border-t-4 border-[#94c13c] w-24 mb-6"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.policies.map((doc) => (
                            <a key={doc.id} href={doc.link} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all">
                                <DocumentIcon />
                                <h3 className="font-bold text-lg text-gray-800 mb-2">{doc.title}</h3>
                                <p className="text-gray-600 text-sm">{doc.description}</p>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Presentations Section */}
                <section className="mt-12">
                     <h2 className="text-2xl font-semibold text-gray-700 mb-1">Training & Presentations</h2>
                     <hr className="border-t-4 border-[#94c13c] w-24 mb-6"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {resources.presentations.map((doc) => (
                            <a key={doc.id} href={doc.link} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all">
                                <PresentationIcon />
                                <h3 className="font-bold text-lg text-gray-800 mb-2">{doc.title}</h3>
                                <p className="text-gray-600 text-sm">{doc.description}</p>
                            </a>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

