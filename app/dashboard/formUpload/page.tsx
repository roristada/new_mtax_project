"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import Swal from "sweetalert2";
import useAuthAdmin from "../../../lib/useAuthAdmin";

const getCurrentYear = () => new Date().getFullYear();
const generateYearOptions = (startYear: number) => {
  const currentYear = getCurrentYear();
  const years = [];
  for (let year = startYear; year <= currentYear; year++) {
    years.push(year);
  }
  return years;
};

const yearOptions = generateYearOptions(2000);

interface FormData {
  companyId: string;
  companyName: string; // Add this line
  month: string;
  year: string;
  file: File | null;
}

interface Company {
  id: string;
  name: string;
}

export default function Component() {
  const [formData, setFormData] = useState<FormData>({
    companyId: "",
    companyName: "", // Add this line
    month: "",
    year: "",
    file: null,
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  useAuthAdmin((authenticated) => {
    setIsAuthChecked(authenticated);
  });

  useEffect(() => {
    
    const fetchCompanies = async () => {
      
      try {
        const res = await fetch(`/api/user`);
        const users: { id: string; company: string; role : string }[] = await res.json();
        console.log(users , "users");

        const companyList = users
          .filter((user) => user.role === "customer") 
          .map((user) => ({
            id: user.id,
            name: user.company,
          }));

        const uniqueCompanies = Array.from(
          new Map(companyList.map((item) => [item.name, item])).values()
        );

        setCompanies(uniqueCompanies);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [id]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: e.target.value }));
    }
  };

  const handleCompanyChange = (value: string) => {
    const selectedCompany = companies.find(company => company.id === value);
    if (selectedCompany) {
      setFormData(prev => ({
        ...prev,
        companyId: value,
        companyName: selectedCompany.name
      }));
    }
  };

  const handleSelectChange = (id: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.file) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select a file to upload.",
      });
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("companyId", formData.companyId);
    data.append("month", formData.month);
    data.append("year", formData.year);
    data.append("file", formData.file);

    console.log("Form Data:", formData);

    try {
      const res = await fetch(`/api/upload`, {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log("Response Data:", responseData);
        Swal.fire({
          icon: "success",
          title: "Upload Successful",
          text: "The file has been uploaded successfully!",
        });
      } else {
        const errorData = await res.json();
        console.error("Upload Failed:", errorData);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
        });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Failed to upload file due to a network or server error.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto my-auto mt-20">
      <CardHeader>
        <CardTitle>Upload CSV File</CardTitle>
        <CardDescription>
          Select a company, enter a month and year, then upload a CSV file.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {loading && <div className="loading-indicator">Uploading...</div>}
          <div className="space-y-2">
            <Label htmlFor="companyId">Company</Label>
            <Select
              value={formData.companyId}
              onValueChange={handleCompanyChange}
            >
              <SelectTrigger id="companyId">
                <SelectValue placeholder="Select a company">
                  {formData.companyName }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select
                value={formData.month}
                onValueChange={(value) => handleSelectChange("month", value)}
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select a month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="2">February</SelectItem>
                  <SelectItem value="3">March</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">May</SelectItem>
                  <SelectItem value="6">June</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="8">August</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select
                value={formData.year}
                onValueChange={(value) => handleSelectChange("year", value)}
              >
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select a year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">CSV File</Label>
            <Input id="file" type="file" onChange={handleChange} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="bg-black" type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}