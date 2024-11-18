"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Link } from "../../../../i18n/routing";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import useAuthAdmin from "../../../../lib/useAuthAdmin";
import { Switch } from "../../../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import TextEditer from "../../../../components/TextEditer/TextEditer";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

// Dynamically import components that might use 'document'
const DynamicTextEdit = dynamic(
  () => import("../../../../components/TextEditer/TextEdit"),
  { ssr: false }
);

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
  const t = useTranslations("BlogManage");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdmin, setisAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useAuthAdmin((authenticated) => {
    if (isMounted) {
      if (!authenticated) {
        setisAdmin(false);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      } else {
        setisAdmin(true);
      }
    }
  });

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/blog`);
      const data = await res.json();
      console.log(data);
      setPosts(data.posts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchPosts();
    }
  }, [fetchPosts, isAdmin]);

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost({
      id: post.id, 
      title: post.title || "",
      content: post.content || "",
      category: post.category || "",
      author: post.author,
      authorId: post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      status: post.status || "Published",
    });
    setIsDialogOpen(true); 
  };

  const handleDeletepost = (id: number) => {
    if (isMounted) {
      Swal.fire({
        title: t('alerts.delete.title'),
        text: t('alerts.delete.text'),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t('alerts.delete.confirmButton'),
      }).then(async (result: any) => {
        if (result.isConfirmed) {
          try {
            const res = await fetch(`/api/blog/${id}`, {
              method: "DELETE",
            });

            if (res.ok) {
              setPosts(posts.filter((posts) => posts.id !== id));
              Swal.fire({
                title: t('alerts.delete.success.title'),
                text: t('alerts.delete.success.text'),
                icon: "success",
              });
            } else {
              Swal.fire({
                title: t('alerts.delete.error.title'),
                text: t('alerts.delete.error.text'),
                icon: "error",
              });
            }
          } catch (error) {
            Swal.fire({
              title: t('alerts.delete.error.title'),
              text: t('alerts.delete.error.generalError'),
              icon: "error",
            });
            console.error("Failed to delete Post:", error);
          }
        }
      });
    }
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
        setPosts((prevPosts) => {
          const newPosts = prevPosts.map((post) =>
            post.id === updatedPost.id ? { ...post, ...updatedPost } : post
          );
          return newPosts;
        });

        Swal.fire({
          title: t('alerts.edit.success.title'),
          text: t('alerts.edit.success.text'),
          icon: "success",
        });
        setSelectedPost(null);
        setIsDialogOpen(false);
        fetchPosts();
      } else {
        Swal.fire({
          title: t('alerts.edit.error.title'),
          text: t('alerts.edit.error.text'),
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: t('alerts.edit.error.title'),
        text: t('alerts.edit.error.generalError'),
        icon: "error",
      });
      console.error("Failed to update Post:", error);
    }
  };

  if (!isMounted) {
    return null; 
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link href={`/blog/admin/blog_post`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("addPost")}
          </Button>
        </Link>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("tableHeaders.title")}</TableHead>
              <TableHead>{t("tableHeaders.date")}</TableHead>
              <TableHead>{t("tableHeaders.category")}</TableHead>
              <TableHead>{t("tableHeaders.author")}</TableHead>
              <TableHead>{t("tableHeaders.status")}</TableHead>
              <TableHead>{t("tableHeaders.actions")}</TableHead>
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
                    timeZone: "Asia/Bangkok",
                  }).format(new Date(post.createdAt))}
                </TableCell>
                <TableCell>{t(`categories.${post.category}`)}</TableCell>
                <TableCell>{post.author.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      post.status === "Published" ? "default" : "secondary"
                    }
                  >
                    {t(`status.${post.status.toLowerCase()}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 ">
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
                          {t("actions.edit")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-full max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{t("dialog.editTitle")}</DialogTitle>
                          <DialogDescription>
                            {t("dialog.editDescription")}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleFormSubmit}>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 items-center gap-4">
                              <Label htmlFor="title" className="">
                                {t("dialog.fields.title")}
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
                            <div className="grid grid-cols-1 items-center gap-4">
                              <Label htmlFor="category" className="text-left">
                                {t("dialog.fields.category")}
                              </Label>
                              <Select
                                value={selectedPost?.category || ""}
                                onValueChange={(value) => {
                                  if (selectedPost) {
                                    setSelectedPost({
                                      ...selectedPost,
                                      category: value,
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t("dialog.fields.category")}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(t.raw("categories")).map(
                                    ([key, value]) => (
                                      <SelectItem key={key} value={key}>
                                        {value as string}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-1 items-center gap-4">
                              <Label htmlFor="content" className="text-left">
                                {t("dialog.fields.content")}
                              </Label>
                              <DynamicTextEdit
                                value={selectedPost?.content || ""}
                                onChange={(newContent: string) => {
                                  if (selectedPost) {
                                    setSelectedPost({
                                      ...selectedPost,
                                      content: newContent,
                                    });
                                  }
                                }}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Switch
                                id="status"
                                checked={selectedPost?.status === "Published"}
                                onCheckedChange={(e) => {
                                  if (selectedPost) {
                                    setSelectedPost({
                                      ...selectedPost,
                                      status: e ? "Published" : "Private",
                                    });
                                  }
                                }}
                              />
                              <Label className="ml-2" htmlFor="status">
                                {t(
                                  `status.${selectedPost?.status.toLowerCase()}`
                                )}
                              </Label>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">
                              {t("dialog.saveChanges")}
                            </Button>
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
                      {t("actions.delete")}
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
