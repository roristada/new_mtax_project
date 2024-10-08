import CustomTooltip from '../../../../../components/Charts/CustomTooltip';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip } from '../../../../../components/ui/chart'
import React, { useState } from 'react'
import { BarChart as RechartsBarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';

interface ChartDataItem {
    year: number;
    Income: number;
    Expense: number;
    Tax: number;
    netIncome: number;
}

interface SelectedDataTypes {
    Income: boolean;
    Expense: boolean;
    Tax: boolean;
    netIncome: boolean;
}

interface FinancialBarChartProps {
    chartData: ChartDataItem[];
    selectedDataTypes: SelectedDataTypes;
}

const chartConfig = {
    Income: {
        label: "Income",
        color: "hsl(var(--chart-1))",
    },
    Expense: {
        label: "Expenses",
        color: "hsl(var(--chart-2))",
    },
    Tax: {
        label: "Tax",
        color: "hsl(var(--chart-3))",
    },
    netIncome: {
        label: "Net",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig;

interface FinancialBarChartProps {
    chartData: ChartDataItem[];
}

const FinancialBarChart: React.FC<FinancialBarChartProps> = ({ chartData, selectedDataTypes }) => {
    

    return (
        <ChartContainer config={chartConfig}>
            <RechartsBarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid
                    vertical={false}
                    horizontal={true}
                    stroke="#000"
                    strokeDasharray="2 2"
                />
                <XAxis
                    dataKey="year"
                    tickLine={true}
                    tickMargin={10}
                    axisLine={true}
                />
                <YAxis
                    tickLine={true}
                    axisLine={true}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(2)}M`}
                    domain={[0, "auto"]}
                />
                <ChartTooltip
                    cursor={false}
                    content={<CustomTooltip />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                {(Object.keys(selectedDataTypes) as Array<keyof SelectedDataTypes>).map(
                    (dataType) =>
                        selectedDataTypes[dataType] && (
                            <Bar
                                key={dataType}
                                dataKey={dataType}
                                fill={chartConfig[dataType].color}
                            />
                        )
                )}
            </RechartsBarChart>
        </ChartContainer>
    )
}

export default FinancialBarChart;