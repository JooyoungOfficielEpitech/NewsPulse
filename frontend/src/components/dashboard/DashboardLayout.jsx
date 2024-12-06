import React, { useState, useEffect } from 'react';
import { useNewsApi } from '@/hooks/useNewsApi';
import { Navigation } from './Navigation';
import { MobileMenu } from './MobileMenu';
import { CategoryBar } from './CategoryBar';
import { TrendChart } from './TrendChart';
import { NewsFeed } from './NewsFeed';
import { CategoryTrendCard } from './CategoryTrendCard';
import { CategoryManager } from './CategoryManager';

const DashboardLayout = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState(60);

  const {
    fetchNews,
    fetchTrends,
    saveUserPreferences,
    getCategories,
    addCategory,
    deleteCategory
  } = useNewsApi();

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

      const newsPromises = selectedCategories.map(category =>
        fetchNews(category, 5)
      );
      const newsResults = await Promise.all(newsPromises);
      setNewsData(newsResults.flat());

      // 트렌드 데이터 로딩
      const trendPromises = selectedCategories.map(async (category) => {
        const response = await fetchTrends([category], selectedInterval);
        return {
          category,
          data: response.data[category].map(point => ({
            timestamp: new Date(point.time).getTime(),
            count: point.count
          }))
        };
      });

      const trendResults = await Promise.all(trendPromises);
      setTrendData(trendResults);

    } catch (error) {
      // console.error('Error loading data:', error);
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

  const handleAddCategory = async (name) => {
    try {
      const newCategory = await addCategory(name);
      setCategories([...categories, newCategory]);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter(c => c.id !== categoryId));
      setSelectedCategories(selectedCategories.filter(c =>
        c !== categories.find(cat => cat.id === categoryId)?.name)
      );
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const toggleCategory = async (category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(newCategories);

    try {
      await saveUserPreferences("user123", newCategories, []);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
      />

      <Navigation 
        onMenuClick={() => setIsMobileMenuOpen(true)}
        onSettingsClick={() => setIsCategoryManagerOpen(true)}
      />

      <CategoryBar 
        categories={categories}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <TrendChart 
            loading={loading}
            trendData={trendData}
            selectedCategories={selectedCategories}
            selectedInterval={selectedInterval}
            onIntervalChange={setSelectedInterval}
          />
          <NewsFeed 
            loading={loading}
            newsData={newsData}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {selectedCategories.map((category, i) => (
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