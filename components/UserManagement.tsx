'use client';

import { useState } from 'react';
import { 
  UserPlus, 
  Users, 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Shield, 
  Edit3, 
  Trash2,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { collection, addDoc, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

interface Department {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  createdAt: Date;
}

interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'admin' | 'user';
  department?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

interface UserManagementProps {
  onUserAdded?: () => void;
}

export function UserManagement({ onUserAdded }: UserManagementProps) {
  const [activeView, setActiveView] = useState<'users' | 'departments'>('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // User form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'user' as 'super_admin' | 'admin' | 'user',
    department: ''
  });

  // Department form state
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: ''
  });

  // Mock data - replace with actual Firestore queries
  const [users, setUsers] = useState<UserAccount[]>([
    {
      uid: '1',
      email: 'brendan@samru.ca',
      displayName: 'Brendan',
      role: 'super_admin',
      department: 'Communications',
      createdAt: new Date(),
    },
    {
      uid: '2',
      email: 'westgate@samru.ca',
      displayName: 'West Gate Manager',
      role: 'admin',
      department: 'West Gate Social',
      createdAt: new Date(),
    },
    {
      uid: '3',
      email: 'staff@samru.ca',
      displayName: 'John Doe',
      role: 'user',
      createdAt: new Date(),
    }
  ]);

  const [departments, setDepartments] = useState<Department[]>([
    { id: '1', name: 'West Gate Social', description: 'Pub operations and events', createdAt: new Date() },
    { id: '2', name: 'Perks Coffee', description: 'Coffee shop operations', createdAt: new Date() },
    { id: '3', name: 'Communications', description: 'Marketing and communications', createdAt: new Date() },
    { id: '4', name: 'Student Services', description: 'Student support programs', createdAt: new Date() },
  ]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate
      if (!newUser.email || !newUser.password || !newUser.displayName) {
        throw new Error('Please fill in all required fields');
      }

      if (newUser.role === 'admin' && !newUser.department) {
        throw new Error('Please select a department for admin users');
      }

      if (newUser.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );

      const uid = userCredential.user.uid;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', uid), {
        uid,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        department: newUser.role === 'admin' ? newUser.department : undefined,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });

      // Add to local state
      setUsers([...users, {
        uid,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        department: newUser.role === 'admin' ? newUser.department : undefined,
        createdAt: new Date(),
      }]);

      setSuccess(`User ${newUser.email} created successfully!`);
      
      // Reset form
      setNewUser({
        email: '',
        password: '',
        displayName: '',
        role: 'user',
        department: ''
      });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowAddUser(false);
        setSuccess('');
      }, 2000);

      if (onUserAdded) onUserAdded();

    } catch (err: any) {
      console.error('Error creating user:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError(err.message || 'Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!newDepartment.name) {
        throw new Error('Department name is required');
      }

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'departments'), {
        name: newDepartment.name,
        description: newDepartment.description,
        createdAt: new Date(),
      });

      // Add to local state
      setDepartments([...departments, {
        id: docRef.id,
        name: newDepartment.name,
        description: newDepartment.description,
        createdAt: new Date(),
      }]);

      setSuccess(`Department "${newDepartment.name}" created successfully!`);
      
      // Reset form
      setNewDepartment({ name: '', description: '' });
      
      setTimeout(() => {
        setShowAddDepartment(false);
        setSuccess('');
      }, 2000);

    } catch (err: any) {
      console.error('Error creating department:', err);
      setError(err.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', uid));
      
      // Remove from local state
      setUsers(users.filter(u => u.uid !== uid));
      
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);

      // Note: Deleting from Firebase Auth requires Admin SDK on backend
      // For now, we just delete from Firestore
      
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(`Password reset email sent to ${email}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error sending reset email:', err);
      setError('Failed to send password reset email');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Manager';
      default:
        return 'User';
    }
  };

  return (
    <div>
      {/* Global Notifications */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-800 font-medium">{success}</p>
          </div>
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveView('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeView === 'users'
              ? 'bg-[#8BC53F] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Manage Users
        </button>
        <button
          onClick={() => setActiveView('departments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeView === 'departments'
              ? 'bg-[#26A9E0] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Manage Departments
        </button>
      </div>

      {/* Users View */}
      {activeView === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">User Accounts</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage staff access and permissions
              </p>
            </div>
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.uid} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#8BC53F] to-[#26A9E0] rounded-xl flex items-center justify-center flex-shrink-0">
                      {user.role === 'super_admin' ? (
                        <Shield className="w-6 h-6 text-white" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{user.displayName}</h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${getRoleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                      {user.department && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {user.department}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResetPassword(user.email)}
                      className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Reset Password
                    </button>
                    {user.role !== 'super_admin' && (
                      <button
                        onClick={() => handleDeleteUser(user.uid, user.email)}
                        className="px-3 py-1.5 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Departments View */}
      {activeView === 'departments' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Departments</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage organizational departments for content management
              </p>
            </div>
            <button
              onClick={() => setShowAddDepartment(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#26A9E0] text-white rounded-lg hover:bg-[#0D6537] transition-colors"
            >
              <Building2 className="w-4 h-4" />
              Add Department
            </button>
          </div>

          {/* Departments List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <Building2 className="w-8 h-8 text-[#26A9E0]" />
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{dept.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{dept.description}</p>
                <div className="text-xs text-gray-500">
                  Created {dept.createdAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New User</h3>
              <button
                onClick={() => setShowAddUser(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent"
                    placeholder="user@samru.ca"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temporary Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent"
                    placeholder="Min. 6 characters"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">User will be prompted to change this on first login</p>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={newUser.displayName}
                    onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent"
                >
                  <option value="user">User (Staff)</option>
                  <option value="admin">Manager (Department Admin)</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {/* Department (only for admins) */}
              {newUser.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent"
                    required
                  >
                    <option value="">Select Department...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDepartment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add Department</h3>
              <button
                onClick={() => setShowAddDepartment(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent"
                  placeholder="e.g., West Gate Social"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26A9E0] focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of this department..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddDepartment(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#26A9E0] text-white rounded-lg hover:bg-[#0D6537] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
