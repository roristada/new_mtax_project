import React, { useState, useEffect } from "react"
import { TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import EmployeeDialog from "../Range_Commission/EmployeeDialog"
import Loading from "@/components/Loading/Loading"

interface Employee {
  name: string
  totalCommission: number
  totalDiligence: number
}

interface CommissionRange {
  min: number
  max: number
  count: number
  employees: Employee[]
  range?: string
}

const chartConfig: Record<string, { label: string; color: string }> = {
  count: {
    label: "Employees",
    color: "",
  },
  "0-10000": {
    label: "฿0-฿10,000",
    color: "hsl(var(--chart-1))",
  },
  "10001-20000": {
    label: "฿10,001-฿20,000",
    color: "hsl(var(--chart-2))",
  },
  "20001-30000": {
    label: "฿20,001-฿30,000",
    color: "hsl(var(--chart-3))",
  },
  "30001-40000": {
    label: "฿30,001-฿40,000",
    color: "hsl(var(--chart-4))",
  },
  "40001-null": {
    label: "฿40,001-฿50,000++",
    color: "hsl(var(--chart-5))",
  },
}

export default function Component({rangeDiligence}:{rangeDiligence: CommissionRange[]}) {
  
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!rangeDiligence) {
      setLoading(true);
    }else{
      setLoading(false);
    }
  }, [rangeDiligence]);

  const handleBarClick = (entry: CommissionRange) => {
    setSelectedEmployees(entry.employees)
    setIsDialogOpen(true)
  }

  const handleChartClick = (state: any) => {
    if (state && state.activePayload) {
      const clickedData = state.activePayload[0].payload
      handleBarClick(clickedData)
    }
  }

  if (loading) {
    return (
        <Loader2 className="h-8 w-8 animate-spin" />
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const renderChart = (data: CommissionRange[], title: string) => (
    <Card className="w-full h-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">Distribution for the year</CardDescription>
      </CardHeader>
      <CardContent className="p-0 h-[300px] max-w-[500px] mx-auto">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data.map((range) => ({
                ...range,
                range: `${range.min}-${range.max}`,
              }))}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: 30,
                bottom: 5,
              }}
              onClick={handleChartClick}
            >
              <YAxis
                dataKey="range"
                type="category"
                tickLine={false}
                axisLine={false}
                width={100}
                tickFormatter={(label) => chartConfig[label].label}
              />
              <XAxis type="number" hide />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`${entry.min}-${entry.max}-${index}`}
                    fill={chartConfig[`${entry.min}-${entry.max}`]?.color || "gray"}
                    cursor="pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-sm pt-4">
        <div className="flex items-center gap-2 font-medium">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span>Diligence Ranges this year</span>
        </div>
        <div className="text-muted-foreground">Showing employee distribution by ranges</div>
      </CardFooter>
    </Card>
  )

  return (
    <div className="w-full mx-auto p-4 space-y-8">
      
      <div className="grid gap-8 md:grid-cols-1">
        {renderChart(rangeDiligence, "Diligence Ranges")}
      </div>
      <EmployeeDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} employees={selectedEmployees} />
    </div>
  )
}