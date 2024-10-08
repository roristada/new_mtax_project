"use client";

import { TrendingUp } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../../components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

interface EmployeeCountGenderByYear {
  year: number;
  gender: "M" | "F" | null;
  _count: {
    _all: number;
  };
}

export default function Radian({
  employeeCountGenderByYear,
}: {
  employeeCountGenderByYear: EmployeeCountGenderByYear[];
}) {
  // Determine the latest year from the data
  const latestYear = Math.max(
    ...employeeCountGenderByYear.map((item) => item.year)
  ).toString();

  // Initialize selectedYear with the latest year
  const [selectedYear, setSelectedYear] = useState<string>(latestYear);

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
  };

  const filteredData = selectedYear
    ? employeeCountGenderByYear.filter(
        (item) => item.year.toString() === selectedYear
      )
    : employeeCountGenderByYear;

  const chartData = [
    {
      male: filteredData.find((item) => item.gender === "M")?._count._all || 0,
      female:
        filteredData.find((item) => item.gender === "F")?._count._all || 0,
      null: filteredData.find((item) => item.gender === null)?._count._all || 0,
    },
  ];

  const chartConfig = {
    male: {
      label: "Male",
      color: "hsl(210, 100%, 50%)", // Blue color
    },
    female: {
      label: "Female",
      color: "hsl(340, 100%, 50%)", // Pink color
    },
    null: {
      label: "Not Specified",
      color: "hsl(45, 100%, 50%)", // Yellow color
    },
  } satisfies ChartConfig;

  const totalEmployees =
    chartData[0].male + chartData[0].female + chartData[0].null;

  const uniqueYears = Array.from(
    new Set(employeeCountGenderByYear.map((item) => item.year.toString()))
  ).sort((a, b) => parseInt(b) - parseInt(a)); // Sort years in descending order

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="text-center">
        <CardTitle>Employee Count</CardTitle>
        <CardDescription>Employee Distribution by Gender</CardDescription>
        <Select onValueChange={handleYearChange} value={selectedYear}>
          <SelectTrigger className="w-[180px] mx-auto mt-2">
            <SelectValue placeholder={selectedYear} />
          </SelectTrigger>
          <SelectContent>
            {uniqueYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-4">
        <ChartContainer
          config={chartConfig}
          className="w-full max-w-[350px] aspect-square"
        >
          <RadialBarChart
            data={chartData}
            startAngle={180}
            endAngle={0}
            innerRadius="50%"
            outerRadius="80%"
          >
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalEmployees.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Employees
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="female"
              stackId="a"
              cornerRadius={5}
              fill={chartConfig.female.color}
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="male"
              stackId="a"
              cornerRadius={5}
              fill={chartConfig.male.color}
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="null"
              stackId="a"
              cornerRadius={5}
              fill={chartConfig.null.color}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-2 pb-4">
        <div className="grid grid-cols-3 gap-2 w-full">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              ></div>
              <span>
                {config.label}:{" "}
                {chartData[0][
                  key as keyof (typeof chartData)[0]
                ].toLocaleString()}{" "}
                (
                {(
                  (chartData[0][key as keyof (typeof chartData)[0]] /
                    totalEmployees) *
                  100
                ).toFixed(1)}
                %)
              </span>
            </div>
          ))}
        </div>
        <div className="text-center text-muted-foreground mt-1">
          Total Employees: {totalEmployees.toLocaleString()} in {selectedYear}
        </div>
      </CardFooter>
    </Card>
  );
}
