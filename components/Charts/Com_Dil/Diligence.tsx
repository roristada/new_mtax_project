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
} from "../../../components/ui/card"
import { ChartContainer, ChartTooltipContent } from "../../../components/ui/chart"
import { useTranslations } from "next-intl"

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

export default function Component({
  rangeDiligence,
  onRangeClick,
}: {
  rangeDiligence: CommissionRange[];
  onRangeClick: (range: string) => void;
}) {
  const t = useTranslations('RangeDiligence');
  
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const chartConfig: Record<string, { label: string; color: string }> = {
    count: {
      label: t('employees'),
      color: "",
    },
    "0-10000": {
      label: t('range1'),
      color: "hsl(var(--chart-1))",
    },
    "10001-20000": {
      label: t('range2'),
      color: "hsl(var(--chart-2))",
    },
    "20001-30000": {
      label: t('range3'),
      color: "hsl(var(--chart-3))",
    },
    "30001-40000": {
      label: t('range4'),
      color: "hsl(var(--chart-4))",
    },
    "40001-null": {
      label: t('range5'),
      color: "hsl(var(--chart-5))",
    },
  }

  useEffect(() => {
    if (!rangeDiligence) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [rangeDiligence]);

  

  if (loading) {
    return <Loader2 className="h-8 w-8 animate-spin" />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('error')}</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const handleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload;
      const range = `${clickedData.min}-${clickedData.max === null ? 'null' : clickedData.max}`;
      onRangeClick(range); // ไม่ต้องเพิ่ม 'commission-' หรือ 'diligence-' ที่นี่
    } else {
    }
  };

  const renderChart = (data: CommissionRange[], title: string) => (
    <Card className="w-full h-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{t('distribution')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 h-[300px] max-w-[500px] mx-auto">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
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
              onClick={handleClick}
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
          <span>{t('diligenceRangesThisYear')}</span>
        </div>
        <div className="text-muted-foreground">{t('showingDistribution')}</div>
      </CardFooter>
    </Card>
  )

  return (
    <div className="w-full mx-auto p-4 space-y-8">
      <div className="grid gap-8 md:grid-cols-1">
        {renderChart(rangeDiligence, t('diligenceRanges'))}
      </div>
      
    </div>
  )
}
