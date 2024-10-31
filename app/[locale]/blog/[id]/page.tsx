"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {Link} from '../../../../i18n/routing';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Separator } from "../../../../components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import Loading from "../../../../components/Loading/Loading";

interface Post {
  id: number;
  title: string;
  authorId: number;
  picture: string;
  content: string;
  category: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    name: string;
  };
}

const categoryMapping: Record<string, string> = {
  basic_accounting: "Basic Accounting Management",
  tax_plan: "Tax Planning and Management",
  financial_plan: "Financial Planning and Business Strategy",
  financial_news: "Financial News and Legal Updates",
  tips: "Expert Advice and Tips",
  other: "Other",
};

export default function BlogDetailWithSidebar({
  params,
}: {
  params: { id: string };
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [recentPost, setRecentPost] = useState<Post[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blog`);
        const data = await res.json();
        

        const sortedPosts = data.posts
          .sort((a: Post, b: Post) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          })
          .slice(0, 5);

        setRecentPost(sortedPosts);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/blog/${params.id}`);
        const data = await res.json();
        console.log("data", data);
        setPost(data.post);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/blog`);
        const data = await res.json();
        setCategories(data.categories);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
    fetchBlog();
    fetchCategories();
  }, [params.id]);

  const getInitials = (name: string) => {
    const nameParts = name.split(" ");
    return nameParts
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  console.log("post?.picture", post?.picture);

  return (
    <>
      <Navbar />
      <div className="w-full my-12 mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <Loading />
        ) : (
          <div className="max-w-[70%] mx-auto lg:grid lg:grid-cols-3 lg:gap-12">
            <article className="col-span-2">
              {post ? (
                <>
                  <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                      {post.title}
                    </h1>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src="/placeholder.svg?height=40&width=40"
                          alt="Author"
                        />
                        <AvatarFallback>
                          {getInitials(post.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {post.author.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Published on{" "}
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </header>
                  <img
                    src={post.picture || "https://via.placeholder.com/400x250"}
                    alt={post.title}
                    className="rounded-lg"
                  />
                  <Separator className="my-8" />
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p dangerouslySetInnerHTML={{ __html: post.content }} />

                    <Separator className="my-8" />
                  </div>
                </>
              ) : (
                <p>Post not found.</p>
              )}
            </article>

            <aside className="mt-12 lg:mt-0">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {recentPost && recentPost.length > 0 ? (
                      recentPost.map((recentPost) => (
                        <li key={recentPost.id}>
                          <Link
                            href={`/blog/${recentPost.id}`}
                            className="text-sm hover:underline"
                          >
                            {recentPost.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              recentPost.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </li>
                      ))
                    ) : (
                      <p>No recent posts available</p>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link
                    href="/blog"
                    className="text-sm hover:underline ml-auto"
                  >
                    View all posts
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <Badge key={category} variant="secondary">
                          {categoryMapping[category] || category}{" "}
                          {/* Use mapping here */}
                        </Badge>
                      ))
                    ) : (
                      <p>No categories available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
