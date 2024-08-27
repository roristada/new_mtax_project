"use client";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

import Loading from "@/components/Loading/Loading";

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
  author: {
    name: string;
  };
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);


  return (
    <>
    <Navbar />
    <div className="bg-background">
      <section className="w-full py-20 md:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Sharing Knowledge, Empowering Minds
            </h1>
            <p className="text-muted-foreground md:text-xl">
              Explore our collection of insightful blog posts and expand your understanding on a wide range of topics.
            </p>
            <Link
              href="#"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              prefetch={false}
            >
              View Blog Posts
            </Link>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          {loading ? (
            <Loading />
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {posts.map(post => (
                <Card key={post.id}>
                  <img
                    src={post.imageUrl || 'https://via.placeholder.com/400x250'}
                    alt="Blog Post Image"
                    width={400}
                    height={250}
                    className="rounded-t-lg object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span>{post.author.name}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {post.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  </>
  );
}
