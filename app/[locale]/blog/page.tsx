"use client";
import React from "react";
import { Link } from "../../../i18n/routing";
import { Card, CardContent, CardFooter } from "../../../components/ui/card";
import Navbar from "../../../components/Navbar";
import { useEffect, useState } from "react";

import Loading from "../../../components/Loading/Loading";
import { Button } from "../../../components/ui/button";
import { Filter } from "lucide-react";
import { Checkbox } from "../../../components/ui/checkbox";
import { Badge } from "../../../components/ui/badge";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Blog");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]); //
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

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

  const toggleCategory = (category: string) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((cat) => cat !== category)
        : [...prevCategories, category]
    );
  };

  const publishedPosts = posts.filter(
    (post) =>
      post.status === "Published" &&
      (selectedCategories.length === 0 ||
        selectedCategories.includes(post.category))
  );

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  return (
    <>
      <Navbar />
      <div className="bg-background min-h-screen">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                {t("title")}
              </h1>
              <p className="text-muted-foreground md:text-xl">
                {t("subtitle")}
              </p>
              <Link
                href="#"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                prefetch={false}
              >
                {t("viewPosts")}
              </Link>
            </div>
          </div>
        </section>

        {/* Blog Posts Section */}
        <section className="w-full py-12 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Filter Button */}
            <div className="flex justify-end mb-8 relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                className="hover:bg-muted"
              >
                <Filter className="h-5 w-5" />
              </Button>

              {/* Filter Dropdown */}
              {showCategoryFilter && (
                <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg p-4 z-10 w-72 border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-base">
                      {t("filterByCategory")}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllCategories}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {t("clearAll")}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-3"
                      >
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label
                          htmlFor={category}
                          className="text-sm font-medium leading-none cursor-pointer hover:text-primary"
                        >
                          {t(`categories.${category}`)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Posts Grid */}
            {loading ? (
              <Loading />
            ) : (
              <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {publishedPosts.length > 0 ? (
                  publishedPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="flex flex-col overflow-hidden group hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={
                            post.picture ||
                            "https://via.placeholder.com/400x250"
                          }
                          alt={post.title}
                          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-primary/80 hover:bg-primary text-white backdrop-blur-sm">
                            {t(`categories.${post.category}`)}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-5 flex-grow">
                        <Link href={`/blog/${post.id}`}>
                          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                        </Link>
                        <div className="mt-3 text-sm text-muted-foreground flex items-center flex-wrap gap-2">
                          <span className="font-medium">
                            {post.author.name}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"></span>
                          <span>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-lg text-muted-foreground">
                      No published posts available.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
