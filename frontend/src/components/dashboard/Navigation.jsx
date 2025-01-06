import React from 'react';
import { Bell, Newspaper, Menu, Settings, LogOut } from 'lucide-react';

export const Navigation = ({ onMenuClick, onSettingsClick, username, onLogout }) => {
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and Menu */}
          <div className="flex items-center space-x-3">
            <button 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all 
                         active:scale-95 shadow-sm"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Newspaper className="h-8 w-8 text-blue-600" />
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">
              NewsPulse
            </span>
          </div>
          
          {/* Center: Category Management - Now visible on mobile */}
          <div className="flex items-center">
            <button 
              className="px-2 md:px-4 py-2 md:py-2.5 rounded-lg bg-white border-2 border-gray-200 
                         hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600
                         active:scale-95 transition-all shadow-sm
                         text-sm font-semibold text-gray-700 flex items-center gap-1 md:gap-2"
              onClick={onSettingsClick}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">카테고리 관리</span>
            </button>
          </div>

          {/* Right: User Info and Logout */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {username && (
              <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50
                            border-2 border-gray-200">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center 
                              justify-center border-2 border-blue-200">
                  <span className="text-sm font-semibold text-blue-600">
                    {username[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {username}님
                </span>
              </div>
            )}
            
            <button 
              className="px-2 md:px-4 py-2 md:py-2.5 rounded-lg bg-white border-2 border-red-200 
                         hover:border-red-500 hover:bg-red-50 hover:text-red-600
                         active:scale-95 transition-all shadow-sm
                         text-sm font-semibold text-gray-700 flex items-center gap-1 md:gap-2"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};