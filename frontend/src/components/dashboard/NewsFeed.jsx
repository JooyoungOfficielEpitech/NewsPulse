import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const NewsFeed = ({ loading, newsData }) => {
  return (
    <Card className="order-1 lg:order-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">실시간 뉴스</CardTitle>
        <div className="flex items-center text-sm text-gray-500">
          <span>최신순</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p>Loading news...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {newsData.map((news, i) => (
              <div key={i} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600">{news.category}</span>
                  <span className="text-xs text-gray-500">{news.published_at}</span>
                </div>
                <h3 className="font-medium mb-1 line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {news.summary || news.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};