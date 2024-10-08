import React, { useState } from "react";
import {
  AlignEndHorizontal,
  BookUser,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
  XAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";

interface ChartData {
  monthIndex: number;
  year: number;
  month: string;
  Income: number;
  Expense: number;
}

interface BarChartComponentProps {
  chartData: ChartData[];
  chartConfig: any;
}

const DynamicChartComponent = ({
  chartData,
  chartConfig,
}: BarChartComponentProps) => {
  const [chartType, setChartType] = useState<"bar" | "area">("bar");

  return (
    <Card>
      <CardHeader className="flex justify-between items-start">
        <div>
          <CardTitle>
            {chartType === "bar" ? "Income - Expense" : "Area Chart - Legend"}
          </CardTitle>
          <CardDescription>
            January - December {chartData.length > 0 ? chartData[0].year : ""}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setChartType("bar")}>
              <BookUser className="mr-2 h-4 w-4" />
              <span>BarChart</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setChartType("area")}>
              <AlignEndHorizontal className="mr-2 h-4 w-4" />
              <span>AreaChart</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          {chartType === "bar" ? (
            <BarChart width={600} height={300} data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Legend />
              <Bar dataKey="Income" fill="var(--color-income)" radius={4} />
              <Bar dataKey="Expense" fill="var(--color-expense)" radius={4} />
            </BarChart>
          ) : (
            <AreaChart width={600} height={300} data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="Income"
                type="natural"
                fill="var(--color-income)"
                fillOpacity={0.4}
                stroke="var(--color-income)"
              />
              <Area
                dataKey="Expense"
                type="natural"
                fill="var(--color-expense)"
                fillOpacity={0.4}
                stroke="var(--color-expense)"
              />
              <Legend />
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default DynamicChartComponent;
