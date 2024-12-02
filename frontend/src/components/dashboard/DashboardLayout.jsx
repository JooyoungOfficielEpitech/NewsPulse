import React, { useState, useEffect } from 'react';
import { Bell, Search, Settings, TrendingUp, Newspaper, Hash, ChevronDown, Menu, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNewsApi } from '@/hooks/useNewsApi';

const DashboardLayout = () => {
  const [selectedCategories, setSelectedCategories] = useState(['정치', '경제']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { fetchNews, fetchTrends, saveUserPreferences } = useNewsApi();
  
  const categories = [
    '정치', '경제', '사회', '생활/문화', '세계', 'IT/과학', '연예', '스포츠'
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 선택된 카테고리별로 뉴스 데이터 가져오기
        const newsPromises = selectedCategories.map(category => 
          fetchNews(category, 5)
        );
        const newsResults = await Promise.all(newsPromises);
        setNewsData(newsResults.flat());

        // 트렌드 데이터 가져오기
        const trendsData = await fetchTrends(selectedCategories);
        setTrendData(trendsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategories]);

  const toggleCategory = async (category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    
    try {
      await saveUserPreferences(
        "user123",
        newCategories,
        []
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <div className="p-4">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="mt-12 space-y-4">
              <div className="relative w-full">
                <Search className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="뉴스 검색..."
                  className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all
                    ${selectedCategories.includes(category)
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 상단 내비게이션 바 */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button 
                className="lg:hidden p-2"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <Newspaper className="h-8 w-8 text-blue-600" />
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">
                NewsPulse
              </span>
            </div>
            
            <div className="hidden lg:flex items-center space-x-6">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="뉴스 검색..."
                  className="pl-10 pr-4 py-2 w-64 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="flex lg:hidden items-center space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 카테고리 선택 바 (데스크톱) */}
      <div className="hidden lg:block bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${selectedCategories.includes(category)
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 트렌드 차트와 실시간 뉴스 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 order-2 lg:order-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">하하 개습갸 배포 다 했쥬? 자동화 했쥬?</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] lg:h-[400px] flex items-center justify-center">
                  <p>Loading trends...</p>
                </div>
              ) : (
                <div className="h-[300px] lg:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      {selectedCategories.map((category, index) => (
                        <Line
                          key={category}
                          type="monotone"
                          dataKey={category}
                          stroke={`hsl(${index * 60}, 70%, 50%)`}
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 실시간 뉴스 피드 */}
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
                        <span className="text-xs text-gray-500">{news.publishedAt}</span>
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
        </div>

        {/* 키워드 트렌드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {selectedCategories.map((category, i) => (
            <Card key={i}>
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
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;