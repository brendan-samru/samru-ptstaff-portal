'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { Loader2, Building } from 'lucide-react';

type Department = {
  id: string;
  name: string;
};

// This component now receives the list of allowed department IDs
type Props = {
  allowedDepartments: string[];
  onSelectDepartment: (departmentId: string) => void;
};

export function DepartmentSelector({ allowedDepartments, onSelectDepartment }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the public list of departments
  useEffect(() => {
    async function loadDepartments() {
      if (!allowedDepartments || allowedDepartments.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      // Query the departments collection, but ONLY for the IDs
      // that this user is allowed to see.
      const q = query(
        collection(db, 'departments'), 
        where(documentId(), 'in', allowedDepartments)
      );
      
      const snap = await getDocs(q);
      const depts = snap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Unnamed Department',
      }));
      setDepartments(depts);
      setLoading(false);
    }
    loadDepartments();
  }, [allowedDepartments]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <p className="mt-2 text-gray-500">Loading departments...</p>
      </div>
    );
  }
  
  if (departments.length === 0) {
    return <p className="text-center text-gray-500">No departments found for your account.</p>
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-center text-gray-900">
        Select Your Department
      </h2>
      <p className="text-center text-gray-600 mt-2">
        Please choose which department you'd like to view.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {departments.map(dept => (
          <button
            key={dept.id}
            onClick={() => onSelectDepartment(dept.id)}
            className="flex flex-col items-center justify-center p-6 bg-gray-50 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <Building className="w-10 h-10 text-blue-500 mb-2" />
            <span className="font-semibold text-gray-800">{dept.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}