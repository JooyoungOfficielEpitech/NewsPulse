import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart
} from 'recharts';
import { Clock } from 'lucide-react';

const TIME_INTERVALS = [
  { value: 15, label: '15분' },
  { value: 30, label: '30분' },
  { value: 60, label: '1시간' },
  { value: 180, label: '3시간' },
  { value: 360, label: '6시간' },
  { value: 10080, label: '1주' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm p-4 border rounded-xl shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">
            {new Date(label).toLocaleString('ko-KR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
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
                <span className="text-sm font-medium">{entry.name}</span>
              </div>
              <span className="text-sm font-bold">{entry.value.toLocaleString()}건</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap gap-4 px-4 py-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-gray-600">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const TrendChart = ({ 
  loading, 
  trendData, 
  selectedCategories, 
  selectedInterval,
  onIntervalChange 
}) => {
  return (
    <Card className="lg:col-span-2 order-2 lg:order-1">
      <CardHeader className="flex flex-col space-y-2 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">실시간 트렌드</CardTitle>
            <p className="text-sm text-gray-500 mt-1">카테고리별 뉴스 발행 추이</p>
          </div>
          <select 
            value={selectedInterval}
            onChange={(e) => onIntervalChange(Number(e.target.value))}
            className="px-4 py-2 bg-gray-50 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {TIME_INTERVALS.map(interval => (
              <option key={interval.value} value={interval.value}>
                {interval.label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] lg:h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              <p className="text-sm text-gray-500">카테고리를 선택해주세요</p>
            </div>
          </div>
        ) : trendData.length === 0 ? (
          <div className="h-[300px] lg:h-[400px] flex items-center justify-center">
            <p className="text-gray-500">데이터가 없습니다</p>
          </div>
        ) : (
          <div className="h-[300px] lg:h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                <defs>
                  {trendData.map((categoryData, index) => (
                    <linearGradient
                      key={categoryData.category}
                      id={`gradient-${categoryData.category}`}
                      x1="0" y1="0" x2="0" y2="1"
                    >
                      <stop 
                        offset="5%" 
                        stopColor={`hsl(${index * 60}, 85%, 60%)`} 
                        stopOpacity={0.15}
                      />
                      <stop 
                        offset="95%" 
                        stopColor={`hsl(${index * 60}, 85%, 60%)`} 
                        stopOpacity={0}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis 
                  type="number"
                  dataKey="timestamp"
                  domain={['auto', 'auto']}
                  tickFormatter={(time) => new Date(time).toLocaleTimeString('ko-KR', {
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Legend content={<CustomLegend />} />
                {trendData.map((categoryData, index) => (
                  <React.Fragment key={categoryData.category}>
                    <Area
                      type="monotone"
                      dataKey="count"
                      data={categoryData.data}
                      name={categoryData.category}
                      fill={`url(#gradient-${categoryData.category})`}
                      stroke="none"
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      data={categoryData.data}
                      name={categoryData.category}
                      stroke={`hsl(${index * 60}, 85%, 60%)`}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 6,
                        strokeWidth: 2,
                        stroke: '#fff',
                        fill: `hsl(${index * 60}, 85%, 60%)`
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