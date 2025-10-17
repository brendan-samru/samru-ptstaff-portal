'use client';

import React, { useState, useEffect, useRef } from 'react';
// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";


// --- Firebase Configuration ---
// A more specific type for the window object to satisfy TypeScript
interface CustomWindow extends Window {
    __firebase_config?: string;
    __app_id?: string;
    __initial_auth_token?: string;
}
declare const window: CustomWindow;


const firebaseConfig =  JSON.parse(
    (typeof window !== 'undefined' && window.__firebase_config) || 
    '{"apiKey":"AI...","authDomain":"...","projectId":"..."}'
);


// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Initialize Storage

// --- Helper Icon Components ---
const DocumentIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#94c13c] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const PresentationIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#94c13c] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const AdminIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>);
const DeleteIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);

// --- Type definition for a resource card ---
interface Resource {
    id: string;
    title: string;
    description: string;
    link: string;
    type: 'policy' | 'presentation';
    filePath: string; // To track the file in Storage
}

// --- Main App Component ---
export default function StaffPortal() {
    // --- State Variables ---
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false); // New state to track auth readiness
    const [policies, setPolicies] = useState<Resource[]>([]);
    const [presentations, setPresentations] = useState<Resource[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [newResourceType, setNewResourceType] = useState<'policy' | 'presentation'>('policy');
    const [newResourceTitle, setNewResourceTitle] = useState('');
    const [newResourceDesc, setNewResourceDesc] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    // --- Effect 1: Handles Firebase Authentication ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setUserId(user ? user.uid : null);
            setIsAuthReady(true); // Signal that Firebase auth has been checked
        });

        const authenticate = async () => {
            if (!auth.currentUser) {
                try {
                    const token = window.__initial_auth_token;
                    if (token) await signInWithCustomToken(auth, token);
                    else await signInAnonymously(auth);
                } catch (error) {
                    console.error("Auth error:", error);
                    setIsAuthReady(true); // Signal ready even on error to prevent eternal loading
                }
            }
        };

        authenticate();

        return () => unsubscribe(); // Cleanup auth listener on component unmount
    }, []);

    // --- Effect 2: Handles Data Fetching, dependent on Authentication ---
    useEffect(() => {
        // Wait until authentication is confirmed and we have a userId
        if (!isAuthReady) {
            setIsLoading(true);
            return;
        };
        
        if (!userId) {
            setIsLoading(false);
            setPolicies([]);
            setPresentations([]);
            return;
        }

        // At this point, we are authenticated and have a userId, so we can fetch data.
        const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
        const resourcesPath = `artifacts/${appId}/users/${userId}/resources`;
        const resourcesCollection = collection(db, resourcesPath);

        const unsubscribeFromData = onSnapshot(resourcesCollection, (snapshot: QuerySnapshot<DocumentData>) => {
            const allResources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
            setPolicies(allResources.filter((r: Resource) => r.type === 'policy'));
            setPresentations(allResources.filter((r: Resource) => r.type === 'presentation'));
            setIsLoading(false); // Data is loaded, no longer loading
        }, (err) => {
            console.error("Firestore Snapshot Error:", err);
            setIsLoading(false); // Stop loading even if there's an error
        });

        // Also, update the manual UI login state from session storage
        const session = sessionStorage.getItem('isLoggedIn');
        const role = sessionStorage.getItem('userRole');
        if (session && role) {
            setIsLoggedIn(true);
            setUserRole(role);
        } else {
            setIsLoggedIn(false);
            setUserRole(null);
        }

        return () => unsubscribeFromData(); // Cleanup data listener

    }, [isAuthReady, userId]); // This effect re-runs ONLY when auth readiness or userId changes


    // --- User Login/Logout Handlers ---
    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (username === 'admin' && password === 'adminpass') {
            setIsLoggedIn(true); setUserRole('admin');
            sessionStorage.setItem('isLoggedIn', 'true'); sessionStorage.setItem('userRole', 'admin');
            setError('');
        } else if (username === 'staff' && password === 'password') {
            setIsLoggedIn(true); setUserRole('staff');
            sessionStorage.setItem('isLoggedIn', 'true'); sessionStorage.setItem('userRole', 'staff');
            setError('');
        } else {
            setError('Invalid username or password.');
        }
    };
    const handleLogout = () => {
        setIsLoggedIn(false); setUserRole(null);
        sessionStorage.clear();
        setUsername(''); setPassword('');
    };

    // --- Admin CRUD Handlers (with File Management) ---
    const handleSaveResource = async () => {
        if (!newResourceTitle || !newResourceDesc || !userId) return;
        if (!editingResource && !selectedFile) {
            alert("Please select a file to upload for a new resource.");
            return;
        }

        setIsUploading(true);
        const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
        const resourcesPath = `artifacts/${appId}/users/${userId}/resources`;
        let downloadURL = editingResource?.link || '#';
        let storagePath = editingResource?.filePath || '';

        try {
            // --- File Upload Logic ---
            if (selectedFile) {
                // If editing and there was an old file, delete it first.
                if (editingResource && editingResource.filePath) {
                    const oldFileRef = ref(storage, editingResource.filePath);
                    await deleteObject(oldFileRef).catch(err => console.error("Old file deletion failed:", err));
                }
                // Upload the new file
                storagePath = `artifacts/${appId}/users/${userId}/files/${Date.now()}_${selectedFile.name}`;
                const newFileRef = ref(storage, storagePath);
                await uploadBytes(newFileRef, selectedFile);
                downloadURL = await getDownloadURL(newFileRef);
            }

            // --- Firestore Document Logic ---
            const resourceData = {
                title: newResourceTitle,
                description: newResourceDesc,
                link: downloadURL,
                filePath: storagePath,
                type: editingResource ? editingResource.type : newResourceType,
            };

            if (editingResource) {
                const resourceDoc = doc(db, resourcesPath, editingResource.id);
                await updateDoc(resourceDoc, resourceData);
            } else {
                await addDoc(collection(db, resourcesPath), resourceData);
            }
        } catch (error) {
            console.error("Error saving resource:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsUploading(false);
            closeModal();
        }
    };

    const handleDeleteResource = async (resource: Resource) => {
        if (!userId) return;
        if (window.confirm(`Are you sure you want to delete "${resource.title}"?`)) {
            try {
                 const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
                // Delete Firestore document
                const resourceDoc = doc(db, `artifacts/${appId}/users/${userId}/resources`, resource.id);
                await deleteDoc(resourceDoc);

                // Delete file from Storage if it exists
                if (resource.filePath) {
                    const fileRef = ref(storage, resource.filePath);
                    await deleteObject(fileRef);
                }
            } catch (error) {
                console.error("Error deleting resource:", error);
                alert("An error occurred during deletion.");
            }
        }
    };

    // --- Modal State Handlers ---
    const openModalForEdit = (resource: Resource) => {
        setEditingResource(resource);
        setNewResourceTitle(resource.title);
        setNewResourceDesc(resource.description);
        setIsModalOpen(true);
    };

    const openModalForNew = () => {
        setEditingResource(null);
        setNewResourceTitle('');
        setNewResourceDesc('');
        setNewResourceType('policy');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingResource(null);
        setSelectedFile(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    if (isLoading) return <div className="bg-gray-100 min-h-screen flex items-center justify-center"><p>Loading Portal...</p></div>;

    // --- RENDER LOGIC ---
    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            {!isLoggedIn ? (
                 <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                        <div className="flex justify-center mb-6"><img src="/logo-signin.jpg" alt="SAMRU Logo" className="w-64" /></div>
                        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Part-Time Staff Portal</h1>
                        <p className="text-center text-gray-500 mb-6">Please sign in to access resources.</p>
                        <form onSubmit={handleLogin}>
                           <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Username</label>
                                <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#94c13c]" placeholder="staff or admin" />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-[#94c13c]" placeholder="password or adminpass" />
                            </div>
                            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                            <div className="flex items-center justify-between">
                                <button type="submit" className="bg-[#94c13c] hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors">Sign In</button>
                            </div>
                             <div className="text-center mt-4">
                                <a href="#" className="inline-block align-baseline font-bold text-sm text-[#00a99d] hover:text-teal-700 transition-colors">Don&apos;t have an account? Register</a>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <>
                    <header className="bg-white shadow-md sticky top-0 z-10">
                        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                            <img src="/logo-nav.png" alt="SAMRU Logo" className="h-14" />
                            <div className="flex items-center space-x-4">
                                <a href="https://samru.ca" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#00a99d] transition-colors">Visit samru.ca</a>
                                <button onClick={handleLogout} className="bg-[#94c13c] hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Logout</button>
                            </div>
                        </div>
                    </header>
                    <main className="container mx-auto px-6 py-8">
                         <h1 className="text-4xl font-bold text-gray-800 mb-8">Staff Resources</h1>
                    
                        {userRole === 'admin' && (
                            <section className="mb-12 bg-teal-50 border-2 border-teal-200 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                <div className="flex items-center"><AdminIcon /><h2 className="text-2xl font-semibold text-gray-700">Admin Controls</h2></div>
                                    <button onClick={openModalForNew} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Manage Content</button>
                                </div>
                            </section>
                        )}

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-700 mb-1">Policies & Procedures</h2>
                            <hr className="border-t-4 border-[#94c13c] w-24 mb-6"/>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {policies.map((doc) => (
                                    <div key={doc.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all relative">
                                        {userRole === 'admin' && (<div className="absolute top-2 right-2 flex space-x-2"><button onClick={() => openModalForEdit(doc)}><EditIcon /></button><button onClick={() => handleDeleteResource(doc)}><DeleteIcon /></button></div>)}
                                        <a href={doc.link} target="_blank" rel="noopener noreferrer" className="w-full">
                                            <DocumentIcon />
                                            <h3 className="font-bold text-lg text-gray-800 mb-2">{doc.title}</h3>
                                            <p className="text-gray-600 text-sm">{doc.description}</p>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section className="mt-12">
                             <h2 className="text-2xl font-semibold text-gray-700 mb-1">Training & Presentations</h2>
                             <hr className="border-t-4 border-[#94c13c] w-24 mb-6"/>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {presentations.map((doc) => (
                                    <div key={doc.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all relative">
                                        {userRole === 'admin' && (<div className="absolute top-2 right-2 flex space-x-2"><button onClick={() => openModalForEdit(doc)}><EditIcon /></button><button onClick={() => handleDeleteResource(doc)}><DeleteIcon /></button></div>)}
                                        <a href={doc.link} target="_blank" rel="noopener noreferrer" className="w-full">
                                            <PresentationIcon />
                                            <h3 className="font-bold text-lg text-gray-800 mb-2">{doc.title}</h3>
                                            <p className="text-gray-600 text-sm">{doc.description}</p>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main>

                    {/* --- ADMIN MODAL (Updated with File Input) --- */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                                <h2 className="text-2xl font-bold mb-4">{editingResource ? 'Edit Resource' : 'Add New Resource'}</h2>
                                {!editingResource && (
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Type</label>
                                        <select value={newResourceType} onChange={(e) => setNewResourceType(e.target.value as 'policy' | 'presentation')} className="w-full p-2 border rounded">
                                            <option value="policy">Policy & Procedure</option>
                                            <option value="presentation">Training & Presentation</option>
                                        </select>
                                    </div>
                                )}
                                <div className="mb-4">
                                    <label className="block text-gray-700">Title</label>
                                    <input type="text" value={newResourceTitle} onChange={(e) => setNewResourceTitle(e.target.value)} className="w-full p-2 border rounded" />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Description</label>
                                    <textarea value={newResourceDesc} onChange={(e) => setNewResourceDesc(e.target.value)} className="w-full p-2 border rounded" rows={3}></textarea>
                                </div>
                                 <div className="mb-6">
                                    <label className="block text-gray-700">File</label>
                                    <p className="text-xs text-gray-500 mb-2">{editingResource ? "Upload a new file to replace the existing one." : "Select a file to upload."}</p>
                                    <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} className="w-full p-2 border rounded bg-gray-50" />
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" disabled={isUploading}>Cancel</button>
                                    <button onClick={handleSaveResource} className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:bg-teal-300" disabled={isUploading}>
                                        {isUploading ? 'Saving...' : (editingResource ? 'Save Changes' : 'Add Resource')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

