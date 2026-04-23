import { getAdminChartDataAction } from "@/lib/actions/admin";
import { StatsChartClient } from "./_components/StatsChartClient";

export default async function AdminStatsPage() {
    const chartData = await getAdminChartDataAction();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">통계 분석</h1>
            <StatsChartClient chartData={chartData} />
        </div>
    );
}
