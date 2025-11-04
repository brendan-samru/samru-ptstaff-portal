'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');   // email OR username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Normalize and decide
    const raw = identifier.trim();
    const isEmail = raw.includes('@'); // simple + reliable for our case
    const loginEmail = isEmail ? raw : `${raw}@samru.local`;

    try {
      await signIn(loginEmail, password);   // your existing signIn (Firebase) call
      router.push('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid credentials');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found for that user');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* ...existing background... */}
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* ...header... */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="identifier" className="block text-sm font-semibold text-gray-900 mb-2">
                  Email or username
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="name@samru.ca or jsmith"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#26A9E0] focus:ring-2 focus:ring-[#26A9E0]/20 transition-all outline-none"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#26A9E0] focus:ring-2 focus:ring-[#26A9E0]/20 transition-all outline-none"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#8BC53F] to-[#26A9E0] text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Signing in…</>) : (<><LogIn className="w-5 h-5" />Sign In</>)}
              </button>
            </form>
            {/* ...help/footer... */}
          </div>
        </div>
      </div>
    </div>
  );
}
