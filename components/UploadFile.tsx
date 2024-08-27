"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Component() {
  const [file, setFile] = useState(null)
  const handleDrop = (e:any) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile)
    }
  }
  const handleFileSelect = (e:any) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
    }
  }
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload CSV File</CardTitle>
        <CardDescription>Drag and drop a CSV file or click the button to select a file.</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted p-8 transition-colors hover:border-primary"
        >
          {file ? (
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <FileIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  {/* <div className="font-medium">{file.name}</div> */}
                  {/* <div className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</div> */}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-2 text-center">
              <UploadIcon className="h-8 w-8 text-muted-foreground" />
              <div>Drag and drop a CSV file here</div>
              <div className="text-sm text-muted-foreground">or click to select a file</div>
            </div>
          )}
          <input
            type="file"
            accept=".csv"
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            onChange={handleFileSelect}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled={!file}>Upload File</Button>
      </CardFooter>
    </Card>
  )
}

function FileIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  )
}


function UploadIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}


function XIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}