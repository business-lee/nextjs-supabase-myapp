"use client";

// Admin 통계 분석 페이지 - 월별 가입자, 모임 추이, 기능 이용률 차트

import { useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { MOCK_USER_GROWTH, MOCK_MEETING_TREND, MOCK_FEATURE_USAGE } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

// 기간 필터 타입 (enum 대신 as const 패턴)
const PERIOD_VALUES = {
    TODAY: "today",
    WEEK: "week",
    MONTH: "month",
    ALL: "all",
} as const;

type PeriodValue = (typeof PERIOD_VALUES)[keyof typeof PERIOD_VALUES];

// 기간별 표시 데이터 개수 매핑
const PERIOD_COUNT: Record<PeriodValue, number | null> = {
    today: 1,
    week: 2,
    month: 3,
    all: null,
};

// Bar 차트 설정
const barChartConfig: ChartConfig = {
    count: {
        label: "신규 가입자",
        color: "hsl(var(--chart-1))",
    },
};

// Line 차트 설정
const lineChartConfig: ChartConfig = {
    created: {
        label: "모임 생성",
        color: "hsl(var(--chart-1))",
    },
    joined: {
        label: "참가 신청",
        color: "hsl(var(--chart-2))",
    },
};

export default function AdminStatsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodValue>(PERIOD_VALUES.MONTH);

    // 기간에 따라 데이터 슬라이싱 (null이면 전체)
    const filteredGrowth = useMemo(() => {
        const count = PERIOD_COUNT[selectedPeriod];
        return count !== null ? MOCK_USER_GROWTH.slice(-count) : MOCK_USER_GROWTH;
    }, [selectedPeriod]);

    const filteredTrend = useMemo(() => {
        const count = PERIOD_COUNT[selectedPeriod];
        return count !== null ? MOCK_MEETING_TREND.slice(-count) : MOCK_MEETING_TREND;
    }, [selectedPeriod]);

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <h1 className="text-3xl font-bold">통계 분석</h1>

            {/* 기간 필터 탭 */}
            <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as PeriodValue)}>
                <TabsList>
                    <TabsTrigger value={PERIOD_VALUES.TODAY}>오늘</TabsTrigger>
                    <TabsTrigger value={PERIOD_VALUES.WEEK}>이번 주</TabsTrigger>
                    <TabsTrigger value={PERIOD_VALUES.MONTH}>이번 달</TabsTrigger>
                    <TabsTrigger value={PERIOD_VALUES.ALL}>전체</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* 차트 그리드 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Bar Chart: 월별 신규 가입자 */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">월별 신규 가입자</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={barChartConfig} className="h-[260px] w-full">
                            <BarChart
                                data={filteredGrowth}
                                margin={{ top: 4, right: 8, left: -16, bottom: 4 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                <ChartTooltip
                                    cursor={false}
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null;
                                        return (
                                            <div className="rounded-lg border bg-white px-3 py-2 text-sm shadow-md">
                                                <p className="font-medium">{label}</p>
                                                <p className="text-muted-foreground">
                                                    신규 가입자:{" "}
                                                    <span className="text-foreground font-semibold">
                                                        {payload[0]?.value}명
                                                    </span>
                                                </p>
                                            </div>
                                        );
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="hsl(var(--chart-1))"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Line Chart: 모임 생성 / 참가 신청 추이 */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">모임 생성 / 참가 신청 추이</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={lineChartConfig} className="h-[260px] w-full">
                            <LineChart
                                data={filteredTrend}
                                margin={{ top: 4, right: 8, left: -16, bottom: 4 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                <ChartTooltip
                                    cursor={false}
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null;
                                        return (
                                            <div className="rounded-lg border bg-white px-3 py-2 text-sm shadow-md">
                                                <p className="mb-1 font-medium">{label}</p>
                                                {payload.map((p) => (
                                                    <p
                                                        key={p.dataKey as string}
                                                        className="text-muted-foreground"
                                                    >
                                                        {p.dataKey === "created"
                                                            ? "모임 생성"
                                                            : "참가 신청"}
                                                        :{" "}
                                                        <span className="text-foreground font-semibold">
                                                            {p.value}건
                                                        </span>
                                                    </p>
                                                ))}
                                            </div>
                                        );
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="created"
                                    stroke="hsl(var(--chart-1))"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="joined"
                                    stroke="hsl(var(--chart-2))"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Legend
                                    formatter={(value) =>
                                        value === "created" ? "모임 생성" : "참가 신청"
                                    }
                                />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Donut Chart: 기능 이용률 */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">기능 이용률</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={MOCK_FEATURE_USAGE}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    dataKey="value"
                                    nameKey="name"
                                    paddingAngle={3}
                                    label={({
                                        name,
                                        percent,
                                    }: {
                                        name?: string;
                                        percent?: number;
                                    }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                >
                                    {MOCK_FEATURE_USAGE.map((entry) => (
                                        <Cell key={entry.name} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value}%`, String(name)]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
