import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";

export default function BlogDetail({ params }: { params: { id: string } }) {
  // In a real application, you would fetch the post data based on the id
  // For this example, we'll use mock data
  const post = {
    id: parseInt(params.id),
    title: "The Future of Web Development",
    author: {
      name: "Jane Doe",
      image: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    category: "Technology",
    status: "Published",
    createdAt: new Date("2023-08-01"),
    updatedAt: new Date("2023-08-02"),
  };

  return (
    <>
      <Navbar />{" "}
      <article className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center space-x-4 mb-6">
          <Avatar>
            <AvatarImage src={post.author.image} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{post.author.name}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {post.createdAt.toLocaleDateString()}
              <Clock className="ml-3 mr-1 h-3 w-3" />
              {Math.ceil(
                (post.updatedAt.getTime() - post.createdAt.getTime()) /
                  (1000 * 60)
              )}{" "}
              min read
            </div>
          </div>
        </div>
        <div className="prose max-w-none mb-6">
          <p>{post.content}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge>{post.category}</Badge>
            <Badge variant="outline">{post.status}</Badge>
          </div>
          <Button variant="outline" size="sm">
            <User className="mr-2 h-4 w-4" />
            Follow Author
          </Button>
        </div>
      </article>
    </>
  );
}
