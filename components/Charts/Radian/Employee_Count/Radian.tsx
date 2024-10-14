"use client";

import { TrendingUp } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart, Tooltip } from "recharts";
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
import { useTranslations } from "next-intl";

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
  const t = useTranslations('Radian');

  const latestYear = Math.max(
    ...employeeCountGenderByYear.map((item) => item.year)
  ).toString();

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
      label: t('male'),
      color: "hsl(210, 100%, 50%)",
    },
    female: {
      label: t('female'),
      color: "hsl(340, 100%, 50%)",
    },
    null: {
      label: t('notSpecified'),
      color: "hsl(45, 100%, 50%)",
    },
  } satisfies ChartConfig;

  const totalEmployees =
    chartData[0].male + chartData[0].female + chartData[0].null;

  const uniqueYears = Array.from(
    new Set(employeeCountGenderByYear.map((item) => item.year.toString()))
  ).sort((a, b) => parseInt(b) - parseInt(a));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold mb-2 text-gray-800 border-b pb-2">{t('gender')}</h3>
          <div className="space-y-2">
            {Object.entries(chartConfig).map(([key, config]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: config.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{config.label}:</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-gray-900">{data[key].toLocaleString()}</span>
                  <span className="text-gray-500 ml-1">
                    ({((data[key] / totalEmployees) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t text-sm font-medium text-gray-700 flex justify-between items-center">
            <span>{t('total')}:</span>
            <span className="text-lg font-bold text-gray-900">{totalEmployees.toLocaleString()}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="text-center">
        <CardTitle>{t('employeeCount')}</CardTitle>
        <CardDescription>{t('employeeDistribution')}</CardDescription>
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
            <Tooltip content={<CustomTooltip />} />
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
                          {t('employees')}
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
          {t('totalEmployees', { count: totalEmployees.toLocaleString(), year: selectedYear })}
        </div>
      </CardFooter>
    </Card>
  );
}
