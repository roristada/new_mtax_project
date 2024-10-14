"use client";
import React, { useEffect, useRef, useMemo, useCallback } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

// Interface for props
interface TextEditerProps {
  onChange: (content: string) => void;
}

const TextEditer: React.FC<TextEditerProps> = ({ onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill>();

  const myColors = useMemo(() => [
    "purple",
    "#785412",
    "#452632",
    "#856325",
    "#963254",
    "#254563",
    "white",
  ], []);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        try {
          const response = await fetch(`/api/upload/img`, {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();

          if (data.url) {
            const range = quillRef.current?.getSelection();
            if (range && quillRef.current) {
              quillRef.current.insertEmbed(range.index, "image", data.url);
              quillRef.current.setSelection(range.index + 1);
              
              // Trigger content update
              const content = quillRef.current.root.innerHTML;
              onChange(content);
            }
          } else {
            console.error("No URL returned from server");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
    };
  }, [onChange]);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ align: ["right", "center", "justify"] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        [{ color: myColors }],
        [{ background: myColors }],
      ],
      handlers: {
        image: handleImageUpload,
      },
    },
  }), [myColors, handleImageUpload]);

  const formats = useMemo(() => [
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
    "align",
  ], []);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        modules,
        formats,
        theme: "snow",
        placeholder: "Type something...",
      });

      quillRef.current.on("text-change", () => {
        const content = quillRef.current?.root.innerHTML || "";
        onChange(content);
      });
    }

    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change");
      }
    };
  }, [modules, formats, onChange]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl p-4 border rounded shadow-lg">
        <div ref={editorRef} className="h-96" />
      </div>
    </div>
  );
};

export default TextEditer;
