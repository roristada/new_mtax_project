"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const TextEditer = dynamic(() => import("@/components/TextEditer/TextEditer"), {
  ssr: false,
});

interface FormData {
  title: string;
  author: string;
  content: string;
  email: string;
  category: string;
}


export default function Component() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    author: "",
    content: "",
    email: "",
    category: "",
  });

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/login");
      } else {
        // Set the author from session
        setFormData((prevData:any) => ({
          ...prevData,
          email: session?.user?.email,
          author: session?.user?.company,
        }));
      }
    } else if (status === "unauthenticated") {
      router.push("/login");
    }

  }, [status, session, router]);
  const handleInputChange = (event: any) => {
    const { id, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      category: value,
    }));
  };


  const handleSubmit = async (event: any) => {
    event.preventDefault();

    console.log("Form Data Submitted Client:", formData);

    try {
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      setLoading(true);

      const data = await response.json();
      console.log("From Server:", data);

      if (response.ok) {
        Swal.fire({
          title: "Good job!",
          text: "You clicked the button!",
          icon: "success",
        }).then(() => {
          setLoading(false);
          router.push("/blog")
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Something went wrong!",
        text: "You clicked the button for Edit!",
        icon: "error",
      });
      setLoading(false);
      console.log(error);
    }
  };


  return (
    <>
      <Navbar />
      <Card className="w-full max-w-2xl mx-auto my-auto mt-20">
        <CardHeader>
          <CardTitle>Create New Blog Post</CardTitle>
          <CardDescription>
            Fill out the form to publish a new blog post.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter the blog post title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Enter the author's name"
                  value={session?.user?.company}
                  onChange={handleInputChange}
                  readOnly
                />
              </div>
            </div>
            <div className="space-y-2 mt-5">
              <Label htmlFor="content">Content</Label>
              <TextEditer
                onChange={(content: string) =>
                  setFormData((prevData) => ({ ...prevData, content }))
                }
              />
            </div>
            
            <div className="space-y-2 mt-5">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Posting a blog..." : "Publish Post"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
