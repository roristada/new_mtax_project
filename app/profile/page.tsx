"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const Profile: React.FC = () => {
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
    "bullet",
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
        theme:"snow"
      });
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleClick = async () => {
    try {
      const res = await fetch("/api/test");
      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="w-1/2 mx-auto mt-20 ">
      <div ref={editorRef} >
        <h2>Demo Content</h2>
        <p>
          Preset build with <code>snow</code> theme, and some common formats.
        </p>
      </div>
      <Button className="w-20" onClick={handleClick}>
        Log Out
      </Button>
    </div>
  );
};

export default Profile;
