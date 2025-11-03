'use client';

import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Hoist the dynamic import to the module scope
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export function QuillField({
  value,
  onChange,
  modules,
  placeholder,
  readOnly = false,
}: {
  value: string;
  onChange: (v: string) => void;
  modules: any;
  placeholder?: string;
  readOnly?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // You can return a simple skeleton loader here if you want
    return <div className="bg-white border rounded-b-md border-gray-300 h-[150px]" />;
  }
  
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      readOnly={readOnly}
      placeholder={placeholder}
      className="bg-white"
    />
  );
}