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
  const [username, setUsername] = useState(''); // 서버에서 가져온 사용자 이름

  const {
    fetchNews,
    fetchTrends,
    saveUserPreferences,
    getCategories,
    addCategory,
    deleteCategory,
    getCurrentUser, // 추가된 함수
  } = useNewsApi();

  // 시용자 로그인 후 뒤로가기 방지
  useEffect(() => {
    const preventBack = () => {
      if (localStorage.getItem("token")) {
        navigate(1); // 앞으로 이동
      }
    };

    window.addEventListener('popstate', preventBack);
    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, [navigate]);


  // 사용자 정보 가져오기
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setUsername(user.username); // 서버에서 가져온 사용자 이름 설정
      } catch (error) {
        
        console.error('Error fetching current user:', error);
      }
    };

    loadCurrentUser();
  }, []);

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
    if (selectedCategories.length > 0) {
      loadData();
    }
  }, [selectedCategories, selectedInterval]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (selectedCategories.length > 0) {
        loadData();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [selectedCategories, selectedInterval]);

  const handleToggleCategory = (categoryName) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName];

      // saveUserPreferences를 통해 서버에 변경사항 저장
      alert(username);
      saveUserPreferences(username, newCategories, []).catch(error => {
        console.error('Error saving category preferences:', error);
      });

      return newCategories;
    });
  };

  const handleAddCategory = async (newCategoryName) => {
    try {
      const newCategory = await addCategory(newCategoryName); // useNewsApi의 addCategory 함수 사용
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error('카테고리 추가 중 오류 발생:', error);
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
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(newCategories);

    try {
      await saveUserPreferences(username, newCategories, []);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('로그아웃 되었습니다.');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        onAddCategory={handleAddCategory} // 여기 추가
        onDeleteCategory={handleDeleteCategory} // 필요하면 추가
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
        onAddCategory={handleAddCategory}  // 새로 추가된 prop
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
            <CategoryTrendCard
              key={category}
              category={category}
              loading={loading}
            />
          ))}
        </div>
      </main>

      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
};

export default DashboardLayout;
