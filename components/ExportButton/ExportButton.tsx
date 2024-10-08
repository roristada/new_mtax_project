'use client'

import React, { useState } from 'react'
import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Loader2, Download } from "lucide-react"

interface ExportButtonProps {
  companyId: string;
}

export default function ExportButton({ companyId }: ExportButtonProps) {
  const [files, setFiles] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/upload?action=list&companyId=${companyId}`);
      const data = await response.json();
      setFiles(data.files);
      setOpen(true);
    } catch (error) {
      console.error('Error fetching files:', error);
      alert('Error to fetch files');
    }
    setLoading(false);
  };

  const handleDownload = async (year: string, fileName: string) => {
    try {
      const response = await fetch(`/api/upload?action=download&companyId=${companyId}&year=${year}&fileName=${fileName}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Cant download file');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleExport} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? 'Loading...' : 'Export'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>File Export</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {Object.entries(files).map(([year, yearFiles]) => (
            <div key={year} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">{year}</h3>
              <ul className="space-y-2">
                {yearFiles.map((file, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="text-sm">{file}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(year, file)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}