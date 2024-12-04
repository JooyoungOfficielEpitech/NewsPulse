import React from 'react';
import { Bell, Search, Settings, Newspaper, Menu } from 'lucide-react';

export const Navigation = ({ onMenuClick, onSettingsClick }) => {
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <button 
              className="lg:hidden p-2"
              onClick={onMenuClick}
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
            <button 
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={onSettingsClick}
            >
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
  );
};