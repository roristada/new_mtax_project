import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useAuthEffect from "@/lib/useAuthEffect";

interface FormData {
  name: string;
  company: string;
  email: string;
  category: string;
  description: string;
}

export default function ProblemReportForm() {
  const { data: session } = useSession();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    company: "",
    email: "",
    category: "",
    description: "",
  });

  const route = useRouter();

  // useAuthEffect((authenticated) => {
  //   setIsAuthChecked(authenticated);
  // });

  useEffect(() => {
    if (session) {
      // Set company and email from session data when session is available
      setFormData((prevData) => ({
        ...prevData,
        company: session.user?.company || "", // If session has company data
        email: session.user?.email || "", // Set email from session data
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Log form data
    console.log("Form submitted:", formData);

    // Reset form fields after submission
    setFormData({
      name: "",
      company: "",
      email: "",
      category: "",
      description: "",
    });

    try {
      const res = await fetch(`/api/support/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Thank you for your report!",
          text: "We will get back to you as soon as possible!",
        }).then(() => {
          route.push(`/dashboard/${session?.user?.id}`);
        });
      } else {
        console.log(res.text);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `Something went wrong! Please try again later.`,
        });
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `Something went wrong! Please try again later.`,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  return (
    <Card className="max-w-lg mx-auto border border-gray-300 rounded-lg shadow-lg p-6 bg-gray-50">
      <CardHeader>
        <CardTitle className="text-center text-3xl font-semibold text-gray-800">
          Report a Problem
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              type="text"
              placeholder="Enter your company name"
              required
              value={formData.company} // Value from session
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Your Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              required
              value={formData.email} // Value from session
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Problem Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prevData) => ({ ...prevData, category: value }))
              }
              required
            >
              <SelectTrigger
                id="category"
                className="border border-gray-300 rounded-md"
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data_problem">Data Problem</SelectItem>
                <SelectItem value="dashboard_problem">
                  Dashboard Problem
                </SelectItem>
                <SelectItem value="appointment_problem">
                  Appointment Problem
                </SelectItem>
                <SelectItem value="feedback">Any Question</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditionally show extra input when "Any Question" is selected */}
          {formData.category === "feedback" ? (
            <div className="space-y-2">
              <Label htmlFor="description">Your Question</Label>
              <Textarea
                id="description"
                placeholder="Please enter your question here..."
                value={formData.description}
                onChange={handleTextareaChange}
                className="border border-gray-300 rounded-md"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="description">Problem Description</Label>
              <Textarea
                id="description"
                placeholder="Please describe the problem you're experiencing..."
                required
                value={formData.description}
                onChange={handleTextareaChange}
                className="border border-gray-300 rounded-md"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Submit Report
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
