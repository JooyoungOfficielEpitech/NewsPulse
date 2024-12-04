import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CategoryTrendCard = ({ category, loading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{category} 트렌드</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <p>Loading trends...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-400">#{j}</span>
                  <span className="font-medium">키워드 {j}</span>
                </div>
                <span className={`text-sm ${j === 1 ? 'text-red-500' : 'text-gray-500'}`}>
                  {j === 1 ? '+45%' : `+${10 * j}%`}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};