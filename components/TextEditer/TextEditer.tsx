"use client";

import React, { useEffect, useRef } from "react";
import Quill from "quill";
import 'quill/dist/quill.snow.css';

interface TextEditerProps {
    onChange: (content: string) => void;
  }
  
  const TextEditer: React.FC<TextEditerProps> = ({ onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill>();

  const myColors = [
    "purple",
    "#785412",
    "#452632",
    "#856325",
    "#963254",
    "#254563",
    "white"
  ];

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ align: ["right", "center", "justify"] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      [{ color: myColors }],
      [{ background: myColors }]
    ]
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "link",
    "color",
    "image",
    "background",
    "align"
  ];

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        modules,
        formats,
        theme:"snow",
        placeholder: 'Type something...',
      });

      quillRef.current.on('text-change', () => {
        const content = quillRef.current?.root.innerHTML || '';
        onChange(content);
      });
    }
  }, [onChange]);



  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl p-4 border rounded shadow-lg">
        <div ref={editorRef} className="h-96" />
      </div>
    </div>
  );
};

export default TextEditer;
