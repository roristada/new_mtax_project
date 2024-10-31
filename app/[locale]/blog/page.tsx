"use client";
import React from "react";
import {Link} from '../../../i18n/routing';
import { Card, CardContent, CardFooter } from "../../../components/ui/card";
import Navbar from "../../../components/Navbar";
import { useEffect, useState } from "react";

import Loading from "../../../components/Loading/Loading";
import { Button } from "../../../components/ui/button";
import { Filter } from "lucide-react";
import { Checkbox } from "../../../components/ui/checkbox";
import { Badge } from "../../../components/ui/badge";


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

// Add this mapping object
const categoryDisplayNames: { [key: string]: string } = {
  basic_accounting: "Basic Accounting Management",
  tax_plan: "Tax Planning and Management",
  financial_plan: "Financial Planning and Business Strategy",
  financial_news: "Financial News and Legal Updates",
  tips: "Expert Advice and Tips",
  other: "Other",
  services: "Services",
};

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]); // New state for selected categories
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  
  // Initialize selectedCategories with all categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    Object.keys(categoryDisplayNames)
  );

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/blog`);
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        console.log("data", data);
        setPosts(data.posts);
        const categoryKeys = Object.keys(categoryDisplayNames);
        setCategories(categoryKeys);
        // Ensure all categories are selected by default
        setSelectedCategories(categoryKeys);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Function to toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((cat) => cat !== category)
        : [...prevCategories, category]
    );
  };

  // Filter posts to only include those with status "Published" and selected categories
  const publishedPosts = posts.filter(
    (post) =>
      post.status === "Published" &&
      (selectedCategories.length === 0 ||
        selectedCategories.includes(post.category))
  );
  

  // Function to clear all selected categories
  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

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
                Explore our collection of insightful blog posts and expand your
                understanding on a wide range of topics.
              </p>
              <Link
                href="#"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                prefetch={false}
              >
                View Blog Posts
              </Link>
              {/* New button with checkbox for category filter */}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex justify-end mb-4 relative">
              <Button
                variant="outline"
                size="icon"
                className=""
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              >
                <Filter className="h-5 w-5" />
              </Button>
              {showCategoryFilter && (
                <div className="absolute right-0 top-12 bg-white shadow-md rounded-md p-4 z-10">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Filter by Category</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllCategories}
                    >
                      Clear All
                    </Button>
                  </div>
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <label
                        htmlFor={category}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {categoryDisplayNames[category] || category}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {loading ? (
              <Loading />
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
                {publishedPosts.length > 0 ? (
                  publishedPosts.map((post) => (
                    <Card key={post.id} className="flex flex-col h-full">
                      <div className="relative w-full h-64">
                        <img
                          src={post.picture || "https://via.placeholder.com/400x250"}
                          alt={post.title}
                          className="rounded-lg"
                        />
                      </div>
                      <CardContent className="p-4 flex-grow">
                        <Link href={`/blog/${post.id}`}>
                          <h3 className="text-lg font-semibold">
                            {post.title}
                          </h3>
                        </Link>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span>{post.author.name}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div
                          className="mt-2 text-sm text-muted-foreground line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                      </CardContent>
                      <CardFooter className="mt-auto flex justify-start">
                        <Badge>{categoryDisplayNames[post.category] || post.category}</Badge>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <p>No published posts available.</p> // Message when no published posts are found
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
