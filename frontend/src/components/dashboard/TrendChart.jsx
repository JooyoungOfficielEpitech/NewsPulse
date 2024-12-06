import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Area, ComposedChart 
} from 'recharts';
import { Clock, RotateCw } from 'lucide-react';
import { useNewsApi } from '@/hooks/useNewsApi';

const TIME_INTERVALS = [
  { value: 15, label: '15분' },
  { value: 30, label: '30분' },
  { value: 60, label: '1시간' },
  { value: 180, label: '3시간' },
  { value: 360, label: '6시간' },
  { value: 10080, label: '1주' },
];

const DEFAULT_COLORS = [
  'hsl(210, 85%, 60%)',  // 파랑
  'hsl(280, 85%, 60%)',  // 보라
  'hsl(350, 85%, 60%)',  // 빨강
  'hsl(150, 85%, 60%)',  // 초록
  'hsl(30, 85%, 60%)'    // 주황
];

const formatTimeString = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const processRawData = (rawData) => {
  if (typeof rawData === 'string') {
    try {
      return JSON.parse(rawData);
    } catch (e) {
      return [];
    }
  }
  return rawData;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-background/90 dark:bg-background/90 backdrop-blur-sm p-4 border rounded-xl shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {formatTimeString(label)}
        </p>
      </div>
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-foreground">{entry.name}</span>
            </div>
            <span className="text-sm font-bold text-foreground">
              {entry.value.toLocaleString()}건
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomLegend = ({ payload }) => {
  if (!payload) return null;
  
  return (
    <div className="flex flex-wrap gap-4 px-4 py-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full transition-colors" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const TrendChart = ({ 
  loading: externalLoading, 
  trendData, 
  selectedCategories, 
  selectedInterval,
  onIntervalChange,
  onRefreshComplete 
}) => {
  const { fetchTrends, refreshSelectedCategories, loading: apiLoading } = useNewsApi();
  const loading = externalLoading || apiLoading;

  const chartData = useMemo(() => {
    const processedData = processRawData(trendData);
    
    if (!Array.isArray(processedData) || processedData.length === 0) {
      return [];
    }

    return processedData
      .filter(item => selectedCategories.includes(item.category))
      .map(item => {
        if (!Array.isArray(item.data)) {
          return null;
        }

        const points = item.data.map(point => ({
          time: point.time,
          timestamp: point.timestamp || new Date(point.time).getTime(),
          count: Number(point.count) || 0
        })).sort((a, b) => a.timestamp - b.timestamp);

        return {
          category: item.category,
          color: DEFAULT_COLORS[selectedCategories.indexOf(item.category) % DEFAULT_COLORS.length],
          data: points
        };
      })
      .filter(Boolean);
  }, [trendData, selectedCategories]);

  const timeRange = useMemo(() => {
    if (!chartData.length) return null;

    const allTimestamps = chartData.flatMap(item => 
      item.data.map(d => d.timestamp)
    );

    if (allTimestamps.length === 0) return null;

    return {
      start: Math.min(...allTimestamps),
      end: Math.max(...allTimestamps)
    };
  }, [chartData]);

  const handleRefresh = async () => {
    try {
      await refreshSelectedCategories(selectedCategories);
      const newTrendData = await fetchTrends(selectedCategories, selectedInterval);
      if (onRefreshComplete) {
        onRefreshComplete(newTrendData);
      }
    } catch (error) {
      console.error('Error refreshing trends:', error);
    }
  };

  return (
    <Card className="lg:col-span-2 order-2 lg:order-1">
      <CardHeader className="flex flex-col space-y-2 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              실시간 트렌드
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              카테고리별 뉴스 발행 추이
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || !selectedCategories.length}
              className="p-2 hover:bg-accent rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                       active:scale-95"
              title="트렌드 새로고침"
            >
              <RotateCw className={`w-5 h-5 text-muted-foreground hover:text-foreground 
                                  ${loading ? 'animate-spin' : ''}`} />
            </button>
            <select 
              value={selectedInterval}
              onChange={(e) => onIntervalChange(Number(e.target.value))}
              className="px-4 py-2 bg-background border rounded-lg text-sm font-medium 
                       focus:outline-none focus:ring-2 focus:ring-primary transition-all
                       dark:bg-background dark:border-border"
            >
              {TIME_INTERVALS.map(interval => (
                <option key={interval.value} value={interval.value}>
                  {interval.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] lg:h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="text-sm text-muted-foreground">데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : !chartData.length ? (
          <div className="h-[300px] lg:h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">
              {selectedCategories?.length ? '데이터가 없습니다' : '카테고리를 선택해주세요'}
            </p>
          </div>
        ) : (
          <div className="h-[300px] lg:h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                <defs>
                  {chartData.map((item) => (
                    <linearGradient
                      key={item.category}
                      id={`gradient-${item.category}`}
                      x1="0" y1="0" x2="0" y2="1"
                    >
                      <stop 
                        offset="5%" 
                        stopColor={item.color}
                        stopOpacity={0.15}
                      />
                      <stop 
                        offset="95%" 
                        stopColor={item.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis 
                  type="number"
                  dataKey="timestamp"
                  domain={timeRange ? [timeRange.start, timeRange.end] : ['auto', 'auto']}
                  tickFormatter={formatTimeString}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ 
                    stroke: 'hsl(var(--muted-foreground))', 
                    strokeWidth: 1, 
                    strokeDasharray: '3 3' 
                  }}
                />
                <Legend content={<CustomLegend />} />
                {chartData.map((item) => (
                  <React.Fragment key={item.category}>
                    <Area
                      type="monotone"
                      dataKey="count"
                      data={item.data}
                      name={item.category}
                      fill={`url(#gradient-${item.category})`}
                      stroke="none"
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      data={item.data}
                      name={item.category}
                      stroke={item.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 6,
                        strokeWidth: 2,
                        stroke: 'hsl(var(--background))',
                        fill: item.color
                      }}
                    />
                  </React.Fragment>
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};