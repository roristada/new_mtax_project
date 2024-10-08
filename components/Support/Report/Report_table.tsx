"use client";
import { useEffect, useState } from "react";
import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  Search,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Card } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "../../../components/ui/dialog"; // Import the dialog component
import { Textarea } from "../../../components/ui/textarea";
import Swal from "sweetalert2";

interface SupportCase {
  id: string; // Add the id property
  name: string;
  category: string;
  status: string;
  description: string;
  createdAt: string;
  problem_report?: string; // Optional property for the resolution report
}

export default function SupportAdmin() {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(6);
  const [report, setReport] = useState<SupportCase[]>([]); // Specify the array type as SupportCase[]
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null); // Allow null for cases where no case is selected
  const [problemReport, setProblemReport] = useState(""); // For storing the report input
  const [searchQuery, setSearchQuery] = useState(""); // Add state for search query

  useEffect(() => {
    const fetchSupport = async () => {
      const response = await fetch(`/api/support/report`);
      const data = await response.json();
      setReport(data.data);
      setTotalPages(Math.ceil(data.data.length / entriesPerPage));
    };

    fetchSupport();
  }, [entriesPerPage]);

  // Filter the report based on the search query
  const filteredReport = report.filter((caseItem) => {
    const categoryMatch = caseItem.category
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const dateMatch = new Date(caseItem.createdAt)
      .toLocaleDateString()
      .includes(searchQuery);
    return categoryMatch || dateMatch;
  });

  // Calculate the starting and ending index for slicing the filtered report
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedReport = filteredReport.slice(startIndex, endIndex);

  const handleReportSubmit = async () => {
    if (selectedCase) {
      const currentSelectedCase = selectedCase; // Store the current case

      // Close the main dialog before showing Swal
      setSelectedCase(null);

      // Ask for confirmation before submitting the report
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You are about to submit a resolution report!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, submit it!",
      });

      // Re-open the dialog if the user cancels
      if (!result.isConfirmed) {
        setSelectedCase(currentSelectedCase);
        return; // Exit if not confirmed
      }

      try {
        const response = await fetch(`/api/support/report`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: currentSelectedCase.id, // The unique id is now used here
            problemReport, // The resolution details
          }),
        });

        if (response.ok) {
          console.log("Report updated successfully");
          // Fetch the updated support cases
          const updatedResponse = await fetch(`/api/support/report`);
          const updatedData = await updatedResponse.json();
          console.log("updatedData", updatedData);
          setReport(updatedData.data); // Update the report state with the new data
          setTotalPages(Math.ceil(updatedData.data.length / entriesPerPage)); // Update the total pages

          // Show success message
          Swal.fire("Submitted!", "Your report has been submitted.", "success");
        } else {
          console.error("Failed to update the report");
          Swal.fire(
            "Error!",
            "There was a problem submitting your report.",
            "error"
          );
        }
      } catch (error) {
        console.error("Error submitting report:", error);
        Swal.fire(
          "Error!",
          "There was an error processing your request.",
          "error"
        );
      }

      // Clear the input after submission
      setProblemReport("");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/support/report`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }), // Pass the id of the report to be deleted
        });

        if (response.ok) {
          console.log("Report deleted successfully");
          // Update the reports state to reflect the deletion
          setReport((prevReports) =>
            prevReports.filter((report) => report.id !== id)
          );
          Swal.fire("Deleted!", "Your report has been deleted.", "success");
        } else {
          console.error("Failed to delete report");
          Swal.fire(
            "Error!",
            "There was a problem deleting the report.",
            "error"
          );
        }
      } catch (error) {
        console.error("Error deleting report:", error);
        Swal.fire(
          "Error!",
          "There was an error processing your request.",
          "error"
        );
      }
    }
  };

  return (
    <Card className="w-full max-w-7xl mx-auto p-6 md:p-8">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-xl md:text-2xl font-semibold">
            Current Support Cases{" "}
            <span className="text-sm font-normal text-gray-500 p-3 bg-gray-200 rounded">
              {report.length}
            </span>
          </h2>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by category or date"
                value={searchQuery} // Bind input value to searchQuery state
                onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery on input change
                className="pl-10 w-64 rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
            {/* <Button variant="outline" size="icon" className="ml-2">
              <Filter className="h-5 w-5" />
            </Button> */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px] text-left">
                  Categories
                </TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created by</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReport.length > 0 ? (
                paginatedReport.map((caseItem: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium truncate">
                      {caseItem.category === "data_problem"
                        ? "Data Problem"
                        : caseItem.category === "Application_Problem"
                        ? "Application Problem"
                        : caseItem.category === "dashboard_problem"
                        ? "Dashboard Problem"
                        : "Any Question"}
                    </TableCell>
                    <TableCell>
                      {new Date(caseItem.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium 
                            ${
                              caseItem.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : caseItem.status === "resolved"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                      >
                        {caseItem.status}
                      </span>
                    </TableCell>
                    <TableCell>{caseItem.name}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {/* Trigger Dialog to show input */}

                          <DropdownMenuItem
                            onClick={() => setSelectedCase(caseItem)}
                          >
                            Problem Resolution Report
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              handleDelete(caseItem.id); // Directly pass the ID of the case item to delete
                              setSelectedCase(null); // Optionally close the dialog after deletion
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No support cases found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Entries per page</span>
            <Select
              value={entriesPerPage.toString()}
              onValueChange={(value) => {
                setEntriesPerPage(parseInt(value));
                setCurrentPage(1); // Reset to first page when entries per page changes
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue>{entriesPerPage}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      {selectedCase && (
        <Dialog
          open={!!selectedCase}
          onOpenChange={() => setSelectedCase(null)}
        >
          <DialogContent className="p-6 rounded-lg shadow-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-800">
                Problem Resolution Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Description for:</span>
                <span className="font-bold text-blue-600">
                  {selectedCase.name}
                </span>
              </div>
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                <p className="text-gray-800">{selectedCase.description}</p>
              </div>

              {selectedCase.status === "resolved" ? (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">
                      Resolution Report for:
                    </span>
                    <span className="font-bold text-blue-600">
                      {selectedCase.name}
                    </span>
                  </div>
                  <div className="p-4 border-l-4 border-green-400 bg-blue-50 rounded">
                    <p className="text-gray-800">
                      {selectedCase.problem_report}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">
                      Enter the resolution report for:
                    </span>
                    <span className="font-bold text-blue-600">
                      {selectedCase.name}
                    </span>
                  </div>
                  <Textarea
                    placeholder="Enter resolution details"
                    value={problemReport}
                    onChange={(e) => setProblemReport(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200"
                  />
                </>
              )}
            </div>
            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedCase(null)}>
                Cancel
              </Button>
              {selectedCase.status !== "resolved" && (
                <Button
                  onClick={handleReportSubmit}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Submit
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
