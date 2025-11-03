'use client';

import { Editor } from '@tinymce/tinymce-react';
import { useEffect, useState } from 'react';

// Your TinyMCE API key
// You can get a free one here: https://www.tiny.cloud/auth/signup/
const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

export function EditorField({
  value,
  onChange,
  readOnly = false,
  placeholder = "Start typing...",
}: {
  value: string | null | undefined;
  onChange: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Show a simple skeleton loader
    return <div className="bg-white border rounded-b-md border-gray-300 h-[150px]" />;
  }

  return (
    <Editor
      apiKey={TINYMCE_API_KEY}
      value={value || ''}
      onEditorChange={(newValue: string) => {
        onChange(newValue);
      }}
      disabled={readOnly}
      init={{
        height: 150,
        menubar: false,
        plugins: [
          'lists', 'link', 'autolink', 'wordcount'
        ],
        toolbar: 'bold italic underline | bullist numlist | link removeformat',
        placeholder: placeholder,
        content_style: 'body { font-family:Inter,sans-serif; font-size:14px }',
        statusbar: false,
      }}
    />
  );
}