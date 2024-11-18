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
import { useTranslations } from "next-intl";

interface SupportCase {
  id: string;
  name: string;
  company: string;
  email: string;
  category: string;
  status: string;
  description: string;
  createdAt: string;
  problem_report?: string;
  images: string; // JSON string of image URLs
}

export default function SupportAdmin() {
  const t = useTranslations('SupportAdmin');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(6);
  const [report, setReport] = useState<SupportCase[]>([]); 
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null); 
  const [problemReport, setProblemReport] = useState(""); 
  const [searchQuery, setSearchQuery] = useState(""); 

  useEffect(() => {
    const fetchSupport = async () => {
      const response = await fetch(`/api/support/report`);
      const data = await response.json();
      setReport(data.data);
      setTotalPages(Math.ceil(data.data.length / entriesPerPage));
      console.log(data)
    };

    fetchSupport();
  }, [entriesPerPage]);

  const filteredReport = report.filter((caseItem) => {
    const categoryMatch = caseItem.category
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const dateMatch = new Date(caseItem.createdAt)
      .toLocaleDateString()
      .includes(searchQuery);
    return categoryMatch || dateMatch;
  });

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedReport = filteredReport.slice(startIndex, endIndex);

  const handleReportSubmit = async () => {
    if (selectedCase) {
      const currentSelectedCase = selectedCase;
      setSelectedCase(null);

      const result = await Swal.fire({
        title: t('confirmSubmitTitle'),
        text: t('confirmSubmitText'),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t('confirmSubmitButton'),
      });

      if (!result.isConfirmed) {
        setSelectedCase(currentSelectedCase);
        return;
      }

      try {
        const response = await fetch(`/api/support/report`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: currentSelectedCase.id,
            problem_report: problemReport,
            status: "resolved",
          }),
        });

        if (response.ok) {
          const updatedResponse = await fetch(`/api/support/report`);
          const updatedData = await updatedResponse.json();
          setReport(updatedData.data);
          setTotalPages(Math.ceil(updatedData.data.length / entriesPerPage));

          Swal.fire(t('submitSuccessTitle'), t('submitSuccessText'), "success");
        } else {
          console.error("Failed to update the report");
          Swal.fire(t('submitErrorTitle'), t('submitErrorText'), "error");
        }
      } catch (error) {
        console.error("Error submitting report:", error);
        Swal.fire(t('submitErrorTitle'), t('submitErrorProcessText'), "error");
      }

      setProblemReport("");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: t('confirmDeleteTitle'),
      text: t('confirmDeleteText'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t('confirmDeleteButton'),
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/support/report`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          setReport((prevReports) =>
            prevReports.filter((report) => report.id !== id)
          );
          Swal.fire(t('deleteSuccessTitle'), t('deleteSuccessText'), "success");
        } else {
          console.error("Failed to delete report");
          Swal.fire(t('deleteErrorTitle'), t('deleteErrorText'), "error");
        }
      } catch (error) {
        console.error("Error deleting report:", error);
        Swal.fire(t('deleteErrorTitle'), t('deleteErrorProcessText'), "error");
      }
    }
  };

  return (
    <Card className="w-full max-w-7xl mx-auto p-6 md:p-8">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-xl md:text-2xl font-semibold">
            {t('title')}{" "}
            <span className="text-sm font-normal text-gray-500 p-3 bg-gray-200 rounded">
              {report.length}
            </span>
          </h2>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  {t('tableHeaders.category')}
                </TableHead>
                <TableHead>{t('tableHeaders.createdAt')}</TableHead>
                <TableHead>{t('tableHeaders.status')}</TableHead>
                <TableHead>{t('tableHeaders.name')}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReport.length > 0 ? (
                paginatedReport.map((caseItem: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium truncate">
                      {t(`categories.${caseItem.category}`)}
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
                        {t(`status.${caseItem.status}`)}
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
                          <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                          {/* Trigger Dialog to show input */}

                          <DropdownMenuItem
                            onClick={() => setSelectedCase(caseItem)}
                          >
                            {t('problemResolutionReport')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              handleDelete(caseItem.id); // Directly pass the ID of the case item to delete
                              setSelectedCase(null); // Optionally close the dialog after deletion
                            }}
                          >
                            {t('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {t('noSupportCases')}
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
          <DialogContent className="p-4 rounded-lg shadow-lg bg-white w-[90vw] max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-800 mb-4">
                {t('problemResolutionReport')}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                <div>
                  <h3 className="font-semibold text-gray-700">{t('name')}</h3>
                  <p>{selectedCase.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">{t('company')}</h3>
                  <p>{selectedCase.company}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">{t('email')}</h3>
                  <p>{selectedCase.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">{t('category')}</h3>
                  <p>{t(`categories.${selectedCase.category}`)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">{t('status')}</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium 
                      ${
                        selectedCase.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : selectedCase.status === "resolved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {t(`status.${selectedCase.status}`)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">{t('createdAt')}</h3>
                  <p>{new Date(selectedCase.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-700 text-sm">{t('description')}</h3>
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded text-sm">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedCase.description}</p>
                </div>
              </div>

              {/* Images */}
              {selectedCase.images && JSON.parse(selectedCase.images).length > 0 && (
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-700 text-sm">{t('attachedImages')}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {JSON.parse(selectedCase.images).map((imageUrl: string, index: number) => (
                      <div key={index} className="relative aspect-video">
                        <img
                          src={imageUrl}
                          alt={`Attached image ${index + 1}`}
                          className="object-cover w-full h-full rounded cursor-pointer hover:opacity-90"
                          onClick={() => {
                            Swal.fire({
                              imageUrl,
                              imageAlt: `Attached image ${index + 1}`,
                              width: 'auto',
                              padding: '1em',
                              showConfirmButton: false,
                              showCloseButton: true,
                              background: '#fff',
                              imageWidth: '100%',
                              imageHeight: 'auto',
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Report Section */}
              {selectedCase.status === "resolved" ? (
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-700 text-sm">{t('resolutionReport')}</h3>
                  <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded text-sm">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedCase.problem_report}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-700 text-sm">{t('enterResolutionReport')}</h3>
                  <Textarea
                    placeholder={t('enterResolutionDetails')}
                    value={problemReport}
                    onChange={(e) => setProblemReport(e.target.value)}
                    className="w-full h-24 text-sm border border-gray-300 rounded focus:ring focus:ring-blue-200"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between mt-4 pt-2 border-t">
              <Button 
                variant="outline" 
                onClick={() => setSelectedCase(null)}
                className="text-sm"
              >
                {t('close')}
              </Button>
              {selectedCase.status !== "resolved" && (
                <Button
                  onClick={handleReportSubmit}
                  className="bg-blue-600 text-white hover:bg-blue-700 text-sm"
                  disabled={!problemReport.trim()}
                >
                  {t('submit')}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}