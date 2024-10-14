"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../../../components/ui/card";
import { Button } from "../../../../../../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../../../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../../components/ui/select";
import { Label } from "../../../../../../../components/ui/label";
import RangeComChart from "../../../../../../../components/Charts/Com_Dil/Commission";
import RangeDilChart from "../../../../../../../components/Charts/Com_Dil/Diligence";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../../components/ui/table";
import { Input } from "../../../../../../../components/ui/input";
import { ArrowUpDown } from "lucide-react";
import { X } from "lucide-react"; // Add this import for the reset icon
import useAuthEffect from "../../../../../../../lib/useAuthEffect";

interface CommissionRange {
  min: number;
  max: number;
  count: number;
  employees: Employee[];
  range?: string;
}

interface Employee {
  name: string;
  totalCommission: number;
  totalDiligence: number;
}

function findRange(value: number, ranges: CommissionRange[]): string {
  for (const range of ranges) {
    if (value >= range.min && (range.max === null || value <= range.max)) {
      return `${range.min.toLocaleString()} - ${range.max === null ? 'ขึ้นไป' : range.max.toLocaleString()}`;
    }
  }
  return 'ไม่พบข้อมูล';
}

function EmployeeTable({ 
  rangeCommission, 
  rangeDiligence, 
  currentPage, 
  itemsPerPage, 
  onPageChange,
  selectedRange
}: { 
  rangeCommission: CommissionRange[], 
  rangeDiligence: CommissionRange[],
  currentPage: number,
  itemsPerPage: number,
  onPageChange: (page: number) => void,
  selectedRange: string | null
}) {
  const t = useTranslations("CommissionDiligence");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<"commission" | "diligence" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  let allEmployees: Employee[] = [];
  
  if (selectedRange) {

    const [type, minStr, maxStr] = selectedRange.split('-');
    const min = parseInt(minStr, 10);
    const max = maxStr === 'null' ? null : parseInt(maxStr, 10);
    

    const relevantRanges = type === 'commission' ? rangeCommission : rangeDiligence;
    const foundRange = relevantRanges.find(r => 
      r.min === min && 
      ((max === null && r.max === null) || (r.max === max))
    );
    
    console.log("Found range:", foundRange);
    
    if (foundRange) {
      allEmployees = foundRange.employees || [];
    } else {
      console.error("Range not found:", { min, max });
    }
  } else {
    // รวมพนักงานทั้งหมดจากทุก range
    allEmployees = Array.from(new Set([
      ...rangeCommission.flatMap(range => range.employees),
      ...rangeDiligence.flatMap(range => range.employees)
    ]));
  }

  const filteredEmployees = allEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sortColumn === "commission") {
      return sortDirection === "asc" 
        ? a.totalCommission - b.totalCommission 
        : b.totalCommission - a.totalCommission;
    } else if (sortColumn === "diligence") {
      return sortDirection === "asc" 
        ? a.totalDiligence - b.totalDiligence 
        : b.totalDiligence - a.totalDiligence;
    }
    return 0;
  });

  const handleSort = (column: "commission" | "diligence") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // คำนวณ index เริ่มต้นและสิ้นสุดสำหรับหน้าปัจจุบัน
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = sortedEmployees.slice(startIndex, endIndex);

  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);

  return (
    <>
      <div className="mb-4">
        <Input
          type="text"
          placeholder={t("searchEmployee")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="font-semibold">{t("employeeName")}</TableHead>
              <TableHead className="font-semibold text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("commission")}
                  className="hover:bg-transparent"
                >
                  {t("commissionValue")}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="font-semibold">{t("commissionRange")}</TableHead>
              <TableHead className="font-semibold text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("diligence")}
                  className="hover:bg-transparent"
                >
                  {t("diligenceValue")}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="font-semibold">{t("diligenceRange")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEmployees.map((employee, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell className="text-right">{employee.totalCommission.toLocaleString()}</TableCell>
                <TableCell>{findRange(employee.totalCommission, rangeCommission)}</TableCell>
                <TableCell className="text-right">{employee.totalDiligence.toLocaleString()}</TableCell>
                <TableCell>{findRange(employee.totalDiligence, rangeDiligence)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div>
          {t("pageInfo", { current: currentPage, total: totalPages })}
        </div>
        <div>
          <Button 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="mr-2"
          >
            {t("previous")}
          </Button>
          <Button 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </>
  );
}

export default function CommissionDiligencePage() {
  const t = useTranslations("CommissionDiligence");
  const params = useParams();
  const slug = params.slug as string;

  const [popoverOpenCom, setPopoverOpenCom] = useState(false);
  const [selectedYearCom, setSelectedYearCom] = useState<number | null>(null);
  const [rangeCommission, setRangeCommission] = useState<CommissionRange[]>([]);
  const [rangeDiligence, setRangeDiligence] = useState<CommissionRange[]>([]);
  const [uniqueYears, setUniqueYears] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useAuthEffect((authenticated) => {
    setIsAuthChecked(authenticated);
  });

  useEffect(() => {
    if (!isAuthChecked){
      return;
    };
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/dashboard/${slug}/com-dil`);
        const data = await response.json();
        setUniqueYears(data.years);
        setSelectedYearCom(data.year);
        setRangeCommission(data.commissionRanges);
        setRangeDiligence(data.diligenceRanges);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [slug, isAuthChecked]);

  useEffect(() => {
    const fetchApi = async () => {
      if (selectedYearCom) {
        try {
          const response = await fetch(
            `/api/dashboard/${slug}/com-dil?year=${selectedYearCom}`
          );
          const data = await response.json();
          console.log("Fetched data:", data); // เพิ่ม log นี้
          setRangeCommission(data.commissionRanges);
          setRangeDiligence(data.diligenceRanges);
        } catch (error) {
          console.error("Error fetching commission data:", error);
        }
      }
    };

    fetchApi();
  }, [selectedYearCom, slug, isAuthChecked]);

  const handleSelectedYearCom = (year: string) => {
    setSelectedYearCom(Number(year));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRangeClick = (range: string) => {
    setSelectedRange(prev => {
      const newRange = prev === range ? null : range;
      return newRange;
    });
  };

  const handleResetRange = () => {
    setSelectedRange(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <CardTitle className="mb-1">
            {t('commissionAndDiligence')}
          </CardTitle>
          <CardDescription className="text-muted-foreground font-semibold">
            {t('viewSummary', { year: selectedYearCom })}
          </CardDescription>
        </div>
        <Popover
          open={popoverOpenCom}
          onOpenChange={setPopoverOpenCom}
        >
          <PopoverTrigger asChild className="mt:2 sm:mt-0">
            <Button variant="outline">{t('filter')}</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] sm:w-[320px]">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">
                  {t('filterData')}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t('setDimensions')}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year-select">{t('year')}</Label>
                <Select
                  value={selectedYearCom?.toString()}
                  onValueChange={handleSelectedYearCom}
                >
                  <SelectTrigger id="year-select">
                    <SelectValue placeholder={t('selectYear')} />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setPopoverOpenCom(false)}>
                {t('apply')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="w-full">
          <RangeComChart 
            rangeCommission={rangeCommission} 
            onRangeClick={(range) => {
              console.log("Clicked commission range:", range);
              handleRangeClick(`commission-${range}`);
            }}
          />
        </div>
        <div className="w-full">
          <RangeDilChart 
            rangeDiligence={rangeDiligence} 
            onRangeClick={(range) => {
              console.log("Clicked diligence range:", range);
              handleRangeClick(`diligence-${range}`);
            }}
          />
        </div>
      </CardContent>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t("employeeDetails")}</h3>
          {selectedRange && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetRange}
              className="flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              {t("resetFilter")}
            </Button>
          )}
        </div>
        <EmployeeTable 
          rangeCommission={rangeCommission} 
          rangeDiligence={rangeDiligence}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          selectedRange={selectedRange}
        />
      </CardContent>
    </Card>
  );
}