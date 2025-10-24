'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Super admins have access to everything - no role check needed
      if (userData?.role === 'super_admin') {
        return;
      }

      // Check role requirements for non-super-admins
      if (requiredRole && userData) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        
        if (!allowedRoles.includes(userData.role)) {
          // Redirect based on their actual role
          if (userData.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/portal');
          }
        }
      }
    }
  }, [user, userData, loading, requiredRole, router, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#26A9E0] animate-spin mx-auto mb-4" />
          <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Super admins bypass all role checks
  if (userData?.role === 'super_admin') {
    return <>{children}</>;
  }

  // Check role requirements for non-super-admins
  if (requiredRole && userData) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(userData.role)) {
      return null;
    }
  }

  return <>{children}</>;
}