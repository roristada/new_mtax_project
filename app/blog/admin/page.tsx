"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Author {
  name: string;
}

interface BlogPost {
  id: number;
  title: string;
  content: string;
  category: string;
  author: Author;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  status: string;
}

const Blog_manage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/blog");
        const data = await res.json();

        setPosts(data);
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    }

    fetchData();
  }, []);

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost({
      id: post.id, // Ensure id is always defined
      title: post.title || "",
      content: post.content || "",
      category: post.category || "",
      author: post.author,
      authorId: post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      status: post.status || "Published",
    });
    setIsDialogOpen(true); // Open the dialog
  };

  const handleDeletepost = (id: number) => {
    Swal.fire({
      title: "Delete Post",
      text: "Are you sure you want to delete this Post?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/blog/${id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            setPosts(posts.filter((posts) => posts.id !== id));
            Swal.fire({
              title: "Deleted!",
              text: "Your Post has been deleted.",
              icon: "success",
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: "Failed to delete the Post.",
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "An error occurred while deleting the Post.",
            icon: "error",
          });
          console.error("Failed to delete Post:", error);
        }
      }
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!selectedPost) return;
  
    try {
      const res = await fetch(`/api/blog/${selectedPost.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: selectedPost.title,
          content: selectedPost.content,
          category: selectedPost.category,
          status: selectedPost.status,
        }),
      });
  
      if (res.ok) {
        const updatedPost = await res.json();
  
        // Update the state with the modified post
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === updatedPost.id ? updatedPost : post
          )
        );
  
        Swal.fire({
          title: "Success!",
          text: "Your Post has been updated.",
          icon: "success",
        });
        setSelectedPost(null); // Close the dialog
        setIsDialogOpen(false); // Ensure the dialog closes
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to update the Post.",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "An error occurred while updating the Post.",
        icon: "error",
      });
      console.error("Failed to update Post:", error);
    }
  };
  
  

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Blog Posts</h1>
        <Link href={"/blog/admin/blog_post"} className="flex">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>

                <TableCell>
                  {new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZone: "Asia/Bangkok", // Thailand time zone
                  }).format(new Date(post.createdAt))}
                </TableCell>

                <TableCell>{post.category?.toUpperCase()}</TableCell>
                <TableCell>{post.author.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      post.status === "Published" ? "default" : "secondary"
                    }
                  >
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                  <Dialog
                      open={isDialogOpen && selectedPost?.id === post.id}
                      onOpenChange={(open) => {
                        if (!open) setIsDialogOpen(false);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => handleEditPost(post)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Post</DialogTitle>
                          <DialogDescription>
                            Make changes to your post here. Click save when
                            you're done.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleFormSubmit}>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="title" className="text-right">
                                Title
                              </Label>
                              <Input
                                id="title"
                                value={selectedPost?.title || ""}
                                onChange={(e) => {
                                  if (selectedPost) {
                                    setSelectedPost({
                                      ...selectedPost,
                                      title: e.target.value,
                                    });
                                  }
                                }}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="category" className="text-right">
                                Category
                              </Label>
                              <Input
                                id="category"
                                value={selectedPost?.category || ""}
                                onChange={(e) => {
                                  if (selectedPost) {
                                    setSelectedPost({
                                      ...selectedPost,
                                      category: e.target.value,
                                    });
                                  }
                                }}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="content" className="text-right">
                                Content
                              </Label>
                              <Textarea
                                id="content"
                                value={selectedPost?.content || ""}
                                onChange={(e) => {
                                  if (selectedPost) {
                                    setSelectedPost({
                                      ...selectedPost,
                                      content: e.target.value,
                                    });
                                  }
                                }}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Save changes</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletepost(post.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Blog_manage;
