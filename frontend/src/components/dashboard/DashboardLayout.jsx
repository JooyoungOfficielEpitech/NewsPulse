import React, { useState, useEffect } from 'react';
import { useNewsApi } from '@/hooks/useNewsApi';
import { Navigation } from './Navigation';
import { MobileMenu } from './MobileMenu';
import { CategoryBar } from './CategoryBar';
import { ChatInterface } from './ChatInterface';
import { NewsFeed } from './NewsFeed';
import { CategoryTrendCard } from './CategoryTrendCard';
import { CategoryManager } from './CategoryManager';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState(60);
  const [username, setUsername] = useState('');
  // 카테고리 추가 진행 중 여부 (추가 후 3초 동안 유지)
  const [categoryLoading, setCategoryLoading] = useState(false);

  const {
    fetchNews,
    fetchTrends,
    saveUserPreferences,
    getCategories,
    addCategory,
    deleteCategory,
    getCurrentUser,
  } = useNewsApi();

  // 뒤로가기 방지
  useEffect(() => {
    const preventBack = () => {
      if (localStorage.getItem("token")) {
        navigate(1);
      }
    };
    window.addEventListener('popstate', preventBack);
    return () => window.removeEventListener('popstate', preventBack);
  }, [navigate]);

  // 사용자 정보 로드
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setUsername(user.username);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    loadCurrentUser();
  }, []);

  // 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // 뉴스와 트렌드 데이터 로드
  const loadData = async () => {
    try {
      setLoading(true);
      const newsPromises = selectedCategories.map((category) =>
        fetchNews(category, 5)
      );
      const newsResults = await Promise.all(newsPromises);
      setNewsData(newsResults.flat());

      const trendPromises = selectedCategories.map(async (category) => {
        const response = await fetchTrends([category], selectedInterval);
        return {
          category,
          data: response.data[category]?.map((point) => ({
            timestamp: new Date(point.time).getTime(),
            count: point.count,
          })) || [],
        };
      });
      const trendResults = await Promise.all(trendPromises);
      setTrendData(trendResults);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategories.length > 0) loadData();
  }, [selectedCategories, selectedInterval]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (selectedCategories.length > 0) loadData();
    }, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [selectedCategories, selectedInterval]);

  // 토글 시, 카테고리 추가 진행 중이면 동작하지 않음
  const handleToggleCategory = (categoryName) => {
    if (categoryLoading) return;
    setSelectedCategories(prev => {
      const newCategories = prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName];

      saveUserPreferences(username, newCategories, []).catch(error => {
        console.error('Error saving category preferences:', error);
      });
      return newCategories;
    });
  };

  // 카테고리 추가: 로딩 상태 관리 및 완료 후 3초간 로딩 스피너 유지
  const handleAddCategory = async (newCategoryName) => {
    if (categoryLoading) return;
    try {
      setCategoryLoading(true);
      const newCategory = await addCategory(newCategoryName);
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error('카테고리 추가 중 오류 발생:', error);
    } finally {
      // 3초 동안 로딩 상태 유지하여 스피너 효과 보여주기
      setTimeout(() => {
        setCategoryLoading(false);
      }, 3000);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter((c) => c.id !== categoryId));
      setSelectedCategories(
        selectedCategories.filter(
          (c) => c !== categories.find((cat) => cat.id === categoryId)?.name
        )
      );
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const toggleCategory = async (category) => {
    handleToggleCategory(category);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        categoryLoading={categoryLoading}
      />

      <Navigation
        username={username}
        onMenuClick={() => setIsMobileMenuOpen(true)}
        onSettingsClick={() => setIsCategoryManagerOpen(true)}
        onLogout={handleLogout}
      />

      <CategoryBar
        categories={categories}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddCategory={handleAddCategory}
        categoryLoading={categoryLoading}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ChatInterface
            loading={loading}
            trendData={trendData}
            selectedCategories={selectedCategories}
            selectedInterval={selectedInterval}
            onIntervalChange={setSelectedInterval}
          />
          <NewsFeed loading={loading} newsData={newsData} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {selectedCategories.map((category) => (
            <CategoryTrendCard key={category} category={category} loading={loading} />
          ))}
        </div>
      </main>

      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        categoryLoading={categoryLoading}
      />
    </div>
  );
};

export default DashboardLayout;
