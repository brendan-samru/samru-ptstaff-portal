'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// add near the top, under imports
const normalize = (role?: string) => {
  if (!role) return undefined;
  return role === "superadmin" ? "super_admin" : (role as UserRole);
};

type UserRoleInput = UserRole | "superadmin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRoleInput | UserRoleInput[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

// inside the component, after you read useAuth():
const userRoleNorm = normalize(userData?.role);

// when building allowedRoles
const raw = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
const allowedNorm = raw.filter(Boolean).map(r => normalize(r as string)!) as UserRole[];


  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Super admins have access to everything
      if (userRoleNorm === "super_admin") return;

      // If role is required, enforce it for non-super-admins
      if (allowedNorm.length && userRoleNorm && !allowedNorm.includes(userRoleNorm)) {
        if (userRoleNorm === "admin") router.push("/admin");
        else router.push("/portal");
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
  if (userRoleNorm === "super_admin") return <>{children}</>;

  // Check required roles for non-super-admins
  if (allowedNorm.length && userRoleNorm && !allowedNorm.includes(userRoleNorm)) {
    return null;
  }

  return <>{children}</>;
}